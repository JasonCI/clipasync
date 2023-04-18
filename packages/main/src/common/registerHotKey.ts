import type {
  BrowserWindow,
  BrowserView,
} from 'electron';
import {
  globalShortcut,
  nativeTheme,
  screen,
  ipcMain,
  app,
} from 'electron';
import * as robot from 'robotjs';
import {getClipboardContent} from '/@/common/clipboard';
import {store} from '/@/common/store';
import type {ClipConfig} from '../../../renderer/types/global';

const registerHotKey = (mainWindow: BrowserWindow): void => {
  const setAutoLogin = (startUpLogin:boolean) => {
    app.setLoginItemSettings({
      openAtLogin: startUpLogin,
      openAsHidden: true,
    });
  };
  // 设置暗黑模式
  const setDarkMode = (isDark:boolean) => {
    if (isDark) {
      nativeTheme.themeSource = 'dark';
      mainWindow.webContents.executeJavaScript(
        'document.body.classList.add("dark");window.rubick.theme="dark"',
      );
      mainWindow.getBrowserViews().forEach((view: BrowserView) => {
        view.webContents.executeJavaScript(
          'document.body.classList.add("dark");window.rubick.theme="dark"',
        );
      });
    } else {
      nativeTheme.themeSource = 'light';
      mainWindow.webContents.executeJavaScript(
        'document.body.classList.remove("dark");window.rubick.theme="light"',
      );
      mainWindow.getBrowserViews().forEach((view: BrowserView) => {
        view.webContents.executeJavaScript(
          'document.body.classList.remove("dark");window.rubick.theme="light"',
        );
      });
    }
  };

  const init = () => {
    const config: ClipConfig = store.getConfig();
    if (import.meta.env.PROD) {
      setAutoLogin(config.startUpLogin);
    }
    setDarkMode(config.darkMode);

    globalShortcut.unregisterAll();
    const ret = globalShortcut.register(config.shortcut, async () => {
      const platform = process.platform;
      if (platform === 'darwin') {
        robot.keyTap('c', 'command');
      } else {
        robot.keyTap('c', 'control');
      }

      setTimeout(async () => {
        const content = await getClipboardContent();
        // 发送到渲染进程
        mainWindow.webContents.send('clipboard', content);
      }, 500);
    });
    if (!ret) {
      console.log('registration failed');
    }
  };
  init();
  ipcMain.on('re-register', () => {
    init();
  });
};
export default registerHotKey;
