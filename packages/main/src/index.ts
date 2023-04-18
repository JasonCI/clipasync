import {app, globalShortcut, ipcMain} from 'electron';
import './security-restrictions';
import {platform} from 'node:process';
import * as robot from 'robotjs';
import {restoreOrCreateWindow} from '/@/common/mainWindow';
import {getClipboardContent, getFiles, writeToClipboard} from '/@/common/clipboard';
import createTray from '/@/common/tray';
import {store} from '/@/common/store';
import type {ClipFile} from '../types/global';

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(async () => {
    const win = await restoreOrCreateWindow();
    const ret = globalShortcut.register('CommandOrControl+Shift+V', async () => {
      const platform = process.platform;
      if (platform === 'darwin') {
        robot.keyTap('c', 'command');
      } else {
        robot.keyTap('c', 'control');
      }

      setTimeout(async () => {
        const content = await getClipboardContent();
        // 发送到渲染进程
        win.webContents.send('clipboard', content);
      }, 500);
    });
    if (!ret) {
      console.log('registration failed');
    }
    createTray(win);
  })
  .catch(e => console.error('Failed create window:', e));

// 接收渲染进程的消息
ipcMain.on('set-clipboard', (event, data) => {
  writeToClipboard(data);
});

ipcMain.on('electron-get-files', async (event, fileStats: ClipFile[]) => {
  event.returnValue = await getFiles(fileStats);
});

ipcMain.on('store-config-get', async (event) => {
  event.returnValue = store.getConfig();
});

ipcMain.on('store-config-set', async (event, val) => {
  store.setRecord('config', val);
});
ipcMain.on('store-record-get', async (event, key: 'send' | 'receive') => {
  event.returnValue = store.getRecord(key);
});

ipcMain.on('store-record-set', async (event, key: 'send' | 'receive', val: any) => {
  store.setRecord(key, val);
});
app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();
});

/**
 * Install Vue.js or any other extension in development mode only.
 * Note: You must install `electron-devtools-installer` manually
 */
if (import.meta.env.DEV) {
  app
    .whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(module => {
      const {default: installExtension, VUEJS3_DEVTOOLS} =
        // @ts-expect-error Hotfix for https://github.com/cawa-93/vite-electron-builder/issues/915
        typeof module.default === 'function' ? module : (module.default as typeof module);

      return installExtension(VUEJS3_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
      });
    })
    .catch(e => console.error('Failed install extension:', e));
}

/**
 * Check for app updates, install it in background and notify user that new version was installed.
 * No reason run this in non-production build.
 * @see https://www.electron.build/auto-update.html#quick-setup-guide
 *
 * Note: It may throw "ENOENT: no such file app-update.yml"
 * if you compile production app without publishing it to distribution server.
 * Like `npm run compile` does. It's ok 😅
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(module => {
      const autoUpdater =
        module.autoUpdater ||
        // @ts-expect-error Hotfix for https://github.com/electron-userland/electron-builder/issues/7338
        (module.default.autoUpdater as (typeof module)['autoUpdater']);
      return autoUpdater.checkForUpdatesAndNotify();
    })
    .catch(e => console.error('Failed check and install updates:', e));
}
