import type { BrowserWindow } from 'electron';
import {dialog, Menu, Tray, app, shell, nativeImage} from 'electron';
import * as os from 'os';
import commonConst from '../../../common/utils/commonConst';
import * as path from 'path';

function createTray(window: BrowserWindow): Promise<Tray> {
  return new Promise(resolve => {
    let url;
    if (commonConst.macOS()) {
      url = '/buildResources/icon@2x.png';
    } else if (commonConst.windows()) {
      url =
        parseInt(os.release()) < 10
          ? '/buildResources/icon@2x.png'
          : '/buildResources/icon@3x.png';
    } else {
      url = '/buildResources/icon.png';
    }
    const icon = nativeImage.createFromPath(path.join(app.getAppPath(), url));
    const appIcon = new Tray(icon);
    const version = process.env.npm_package_version;
    const getShowAndHiddenHotKey = () => {
      // const config = global.OP_CONFIG.get();
      // return config.perf.shortCut.showAndHidden;
      return '';
    };

    const openSettings = () => {
      window.webContents.executeJavaScript(
        'window.rubick && window.rubick.openMenu && window.rubick.openMenu({ code: "settings" })',
      );
      window.show();
    };

    const createContextMenu = () =>
      Menu.buildFromTemplate([
        {
          label: '帮助文档',
          click: () => {
            process.nextTick(() => {
              shell.openExternal('https://github.com/JasonCI/clipasync');
            });
          },
        },
        {
          label: '意见反馈',
          click: () => {
            process.nextTick(() => {
              shell.openExternal('https://github.com/JasonCI/clipasync/issues');
            });
          },
        },
        { type: 'separator' },
        {
          label: '显示窗口',
          accelerator: getShowAndHiddenHotKey(),
          click() {
            window.show();
          },
        },
        {
          label: '系统设置',
          click() {
            openSettings();
          },
        },
        { type: 'separator' },
        {
          role: 'quit',
          label: '退出',
        },

        { type: 'separator' },
        {
          label: '关于',
          click() {
            dialog.showMessageBox({
              title: 'clip-async',
              message: '剪贴板同步',
              detail: `Version: ${version}\nAuthor: JasonCi`,
            });
          },
        },
      ]);
    appIcon.on('click', () => {
      appIcon.setContextMenu(createContextMenu());
      appIcon.popUpContextMenu();
    });
    appIcon.setContextMenu(createContextMenu());

    resolve(appIcon);
  });
}

export default createTray;
