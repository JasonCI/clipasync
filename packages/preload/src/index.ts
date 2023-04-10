/**
 * @module preload
 */

export {sha256sum} from './nodeCrypto';
export {versions} from './versions';

import {contextBridge, ipcRenderer,ipcMain} from 'electron';

contextBridge.exposeInMainWorld('electron', {
  onClipboard: callback => ipcRenderer.on('clipboard', callback),
  setClipboard: (data) => {
    console.log('preload,',data);
    ipcRenderer.send('set-clipboard', data);
  },
});
