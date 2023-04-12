import type {
  BrowserWindow,
  BrowserView} from 'electron';
import {
  globalShortcut,
  nativeTheme,
  screen,
  ipcMain,
  app,
} from 'electron';
import * as robot from 'robotjs';
import {getClipboardContent} from '/@/common/clipboard';

const registerHotKey = (mainWindow: BrowserWindow): void => {
  // 设置开机启动
  const setAutoLogin = () => {
    const config = global.OP_CONFIG.get();
    app.setLoginItemSettings({
      openAtLogin: config.perf.common.start,
      openAsHidden: true,
    });
  };
  // 设置暗黑模式
  const setDarkMode = () => {
    const config = global.OP_CONFIG.get();
    const isDark = config.perf.common.darkMode;
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
    if(import.meta.env.PROD){
      setAutoLogin();
    }
    // setDarkMode();

    globalShortcut.unregisterAll();
    const ret = globalShortcut.register('CommandOrControl+B', async () => {
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
    const config = global.OP_CONFIG.get();
    // 注册偏好快捷键
    globalShortcut.register(config.perf.shortCut.showAndHidden, () => {
      const currentShow = mainWindow.isVisible() && mainWindow.isFocused();
      if (currentShow) return mainWindow.hide();

      const { x, y } = screen.getCursorScreenPoint();
      const currentDisplay = screen.getDisplayNearestPoint({ x, y });
      const wx = parseInt(
        String(
          currentDisplay.workArea.x + currentDisplay.workArea.width / 2 - 400,
        ),
      );
      const wy = parseInt(
        String(
          currentDisplay.workArea.y + currentDisplay.workArea.height / 2 - 200,
        ),
      );

      mainWindow.setAlwaysOnTop(true);
      mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      mainWindow.focus();
      mainWindow.setVisibleOnAllWorkspaces(false, {
        visibleOnFullScreen: true,
      });
      mainWindow.setPosition(wx, wy);
      mainWindow.show();
    });

    // globalShortcut.register(config.perf.shortCut.separate, () => {
    //
    // });

    globalShortcut.register(config.perf.shortCut.quit, () => {
      // mainWindow.webContents.send('init-rubick');
      // mainWindow.show();
    });



    // 注册自定义全局快捷键
    config.global.forEach((sc) => {
      if (!sc.key || !sc.value) return;
      globalShortcut.register(sc.key, () => {
        mainWindow.webContents.send('global-short-key', sc.value);
      });
    });
  };
  init();
  ipcMain.on('re-register', () => {
    init();
  });
};
export default registerHotKey;
