<script lang="ts" setup>
import {ref} from 'vue';
import FileList from '/@/components/FileList.vue';
import IconSend from '/@/icons/Send.vue';
import IconReceive from '/@/icons/Receive.vue';
import type {TransferData} from '../utils/peer';
import {usePeer} from '../utils/peer';
import IconSetting from '/@/icons/Setting.vue';
import type {ClipFile} from '../../main/types/global';
import {fileSize} from '../utils';
import ConfigEdit from '/@/components/ConfigEdit.vue';
import type {ClipConfig} from '../types/global';
import {useReceiveHistory, useSendHistory} from '../utils/transferHistory';

const active = ref('send');
const config: ClipConfig = window.electron.store.getConfig();
const sendMap = window.electron.store.getRecord('send');
const receiveMap = window.electron.store.getRecord('receive');

export interface ClipData {
  type: 'text' | 'empty' | 'file';
  content: string | ClipFile[];
}


const {map: sendList, set: sendMapSet} = useSendHistory(config.maxSendRecord, sendMap);
const {map: receiveList, set: receiveMapSet} = useReceiveHistory(config.maxReceiveRecord, receiveMap);

const {join, send, msgList, connected, loading, remotePeerId} = usePeer(data => {
  const {date, type, name, data: content} = data;
  if (data.type === 'file') {
    receiveMapSet(name, {type, name, date, content});
  }
  if (data.type === 'text') {
    receiveMapSet(content, {type, content, name: content, date});
  }
  window.electron.setClipboard(data);
});


// 调用主进程中的 clipboard 模块
window.electron.onClipboard((evt, {type, content}: ClipData) => {
  if (content.length) {
    let name, data;
    const date = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    if (type === 'text') {
      name = content.slice(0, 50);
      data = {type, content, name: content, size: content.length, date};
    }
    if (type === 'file') {
      name = content[0]?.name;
      if (content.length > 1) {
        name += '等' + content.length + '个文件';
      }
      const size = (content as ClipFile[]).reduce((sum, file) => sum + file.size, 0);
      data = {type, name, content, size: fileSize(size), date};
    }
    sendMapSet(name, data);
    send(data as TransferData);
  }
});
</script>

<template>
  <main>
    <ul class="menu">
      <li
        :class="{active: active === 'send'}"
        @click="active = 'send'"
      >
        <IconSend />
        <span>发送</span>
      </li>
      <li
        :class="{active: active === 'receive'}"
        @click="active = 'receive'"
      >
        <IconReceive />
        <span>接收</span>
      </li>
      <li
        :class="{active: active === 'setting'}"
        @click="active = 'setting'"
      >
        <IconSetting />
        <span>设置</span>
      </li>
    </ul>
    <section>
      <FileList
        v-show="active === 'send'"
        type="send"
        :list="sendList"
      ></FileList>
      <FileList
        v-show="active === 'receive'"
        type="receive"
        :list="receiveList"
      ></FileList>
      <config-edit v-show="active === 'setting'"></config-edit>
    </section>
  </main>
  <div
    v-if="!connected"
    class="mask"
  >
    <div class="content">
      <input
        v-model="remotePeerId"
        maxlength="6"
        style="text-align: center"
        placeholder="输入六位数字id配对"
      />
      <button
        :disabled="!remotePeerId||loading"
        @click="join"
      >
        建立连接
      </button>
    </div>
    <ul class="msg">
      <li
        v-for="msg in msgList"
        :key="msg"
      >
        - {{ msg }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.mask {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 9;
  background-color: rgba(238, 238, 238, 0.91);

  .content {
    position: absolute;
    left: 50%;
    top: 30%;
    transform: translate(-50%, -50%);
    width: 240px;
    background: #eeeeee;
    overflow: hidden;
    z-index: 1;
    -webkit-app-region: no-drag;
    input {
      width: 233px;
      padding: 5px;
      border: none;
      font-size: 33px;

      &::placeholder {
        font-size: 16px;
        color: #929898;
      }
    }

    button {
      width: 240px;
      margin-top: 10px;
      //height: 20px;
      font-size: 16px;
      display: inline-block;
    }
  }

  ul.msg {
    z-index: 0;
    position: absolute;
    bottom: 0;
    right: 10px;
    list-style: none;
    color: rgb(115, 114, 114);
    font-size: 11px;

    li {
      margin: 2px 4px;
    }
  }
}

main {
  display: flex;
  height: 100vh;

  ul {
    margin: 0;
    padding: 0;
  }

  ul.menu {
    width: 50px;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-right: 1px solid gainsboro;
    background-color: #eeeeee;
    -webkit-app-region: drag;
    li {
      -webkit-app-region: no-drag;
      padding: 6px 0 8px 0;
      cursor: pointer;
      font-size: 18px;
      text-align: center;

      span {
        display: block;
        font-size: 10px;
      }

      &.active {
        background-color: #929898;
        color: white;
      }
    }
  }

  section {
    flex: 1;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-app-region: drag;
    .title {
      font-weight: 300;
      text-align: center;
      font-size: 15px;
      height: 28px;
      line-height: 28px;
      background-color: #eeeeee;
      border-bottom: 1px solid gainsboro;
    }
  }
}
</style>
