import type {ClipFile} from '../../main/types/global';

declare global {
  interface Window {
    electron: IMessageAPI;
  }
}

export interface IMessageAPI {
  onClipboard: (cb: any) => void;
  setClipboard: (data: any) => void;
  getFiles: (stats: ClipFile[]) => ClipFile[];
  store: {
    getConfig: () => any;
    setConfig: (val: any) => void;
    getRecord: (key: 'send' | 'receive') => any;
    setRecord: (key: 'send' | 'receive', val: any) => void;
    delRecord: (val: any) => void;
    // any other methods you've defined...
  };
}


export interface ClipConfig {
  shortcut: string // 快捷键
  onlyReceive: boolean, // 只接收
  startUpLogin: boolean//开机启动
  listenBoard: boolean // 是否监听
  darkMode: boolean
  maxSendRecord: number // 最大发送记录
  maxReceiveRecord: number
}
