import type { BrowserWindow} from 'electron';
import {app, globalShortcut, ipcMain, protocol} from 'electron';
import './security-restrictions';
import commonConst from '../../common/utils/commonConst';
import createTray from '/@/common/tray';
import registerHotKey from '/@/common/registerHotKey';
import main from '/@/common/main';
import {writeToClipboard} from '/@/common/clipboard';
import Store from 'electron-store';

const store = new Store();


/**
 * Prevent electron from running multiple instances.
 */
class App{
  public windowCreator: { init: () => void; getWindow: () => BrowserWindow };

  constructor() {
    protocol.registerSchemesAsPrivileged([
      { scheme: 'app', privileges: { secure: true, standard: true } },
    ]);
    this.windowCreator = main();
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
    } else {
      this.beforeReady();
      this.onReady();
      this.onRunning();
      this.onQuit();
    }
    ipcMain.on('set-clipboard', (event, data) => {
      writeToClipboard(data);
    });
    ipcMain.on('electron-store-get', async (event, val) => {
      event.returnValue = store.get(val);
    });
    ipcMain.on('electron-store-set', async (event, key, val) => {
      store.set(key, val);
    });
  }
  createWindow() {
    this.windowCreator.init();
  }
  beforeReady(){
    // 系统托盘
    if (commonConst.macOS()) {
      if (commonConst.production() && !app.isInApplicationsFolder()) {
        app.moveToApplicationsFolder();
      } else {
        app.dock.hide();
      }
    } else {
      app.disableHardwareAcceleration();
    }
  }

  onReady(){
    const readyFunction = () => {
      this.createWindow();
      // const mainWindow = this.windowCreator.getWindow();
      // API.init(mainWindow);
      createTray(this.windowCreator.getWindow());
      registerHotKey(this.windowCreator.getWindow());

      if (import.meta.env.DEV) {
        import('electron-devtools-installer')
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
        import('electron-updater')
          .then(module => {
            const autoUpdater =
              module.autoUpdater ||
              // @ts-expect-error Hotfix for https://github.com/electron-userland/electron-builder/issues/7338
              (module.default.autoUpdater as (typeof module)['autoUpdater']);
            return autoUpdater.checkForUpdatesAndNotify();
          })
          .catch(e => console.error('Failed check and install updates:', e));
      }

    };
    if (!app.isReady()) {
      app.whenReady().then(readyFunction);
    } else {
      readyFunction();
    }
  }
  onRunning(){
    app.on('second-instance', () => {
      // 当运行第二个实例时,将会聚焦到myWindow这个窗口
      const win = this.windowCreator.getWindow();
      if (win) {
        if (win.isMinimized()) {
          win.restore();
        }
        win.focus();
      }
    });
    app.on('activate', () => {
      if (!this.windowCreator.getWindow()) {
        this.createWindow();
      }
    });
  }
  onQuit(){
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });

    if (commonConst.dev()) {
      if (process.platform === 'win32') {
        process.on('message', (data) => {
          if (data === 'graceful-exit') {
            app.quit();
          }
        });
      } else {
        process.on('SIGTERM', () => {
          app.quit();
        });
      }
    }
  }
}
export default new App();
