/**
 * @module preload
 */

import type {ClipFile} from '../../main/types/global';

export {sha256sum} from './nodeCrypto';
export {versions} from './versions';

import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electron', {
  onClipboard: (callback: () => void) => ipcRenderer.on('clipboard', callback),
  setClipboard: (data: any) => {
    ipcRenderer.send('set-clipboard', data);
  },
  getFiles: (stats: ClipFile[]) => {
    return ipcRenderer.sendSync('electron-get-files', stats);
  },
  store: {
    getConfig() {
      return ipcRenderer.sendSync('store-config-get');
    },
    setConfig(val: any) {
      ipcRenderer.send('store-config-set', val);
    },
    getRecord(key: 'send' | 'receive') {
      return ipcRenderer.sendSync('store-record-get', key);
    },
    setRecord(key: 'send' | 'receive', val: any) {
      ipcRenderer.send('store-record-set', key, val);
    },
    delRecord(val: any) {
      ipcRenderer.send('store-record-del', val);
    },
  },
});
