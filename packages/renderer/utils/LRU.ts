import type {Ref} from 'vue';
import { ref} from 'vue';

export class LRU {
  private len: number;
  private map: Ref = ref(new Map());

  constructor(len: number,map=null) {
    if (len < 0) throw new Error('缓存长度不能小于0');
    this.len = len;
    if (map) {
      this.map = ref(map);
    }
  }

  getMap(){
    return this.map;
  }
  set(key: any, val: any) {
    if (this.map.value.has(key)) {
      this.map.value.delete(key);
    }
    this.map.value.set(key, val);
    if (this.map.value.size > this.len) {
      const k = this.map.value.keys().next().value;
      this.map.value.delete(k);
    }
  }

  get(key: any): any {
    if (!this.map.value.has(key)) return null;
    const val = this.map.value.get(key);
    this.map.value.delete(key);
    this.map.value.set(key, val);
    return val;
  }
}


export class SendLRU extends LRU {
  constructor(len: number,map=null) {
    super(len,map);
  }
  set(key: any, val: any) {
    super.set(key, val);
    window.electron.store.setRecord('send', this.getMap());
  }
}
export class ReceiveLRU extends LRU {
  constructor(len: number,map=null) {
    super(len,map);
  }
  set(key: any, val: any) {
    super.set(key, val);
    window.electron.store.setRecord('receive', this.getMap());
  }

  get(key: any): any {
    return super.get(key);
  }
}
