import * as fs from 'fs';
import * as path from 'path';
import {app} from 'electron';
import type {ClipConfig} from '../../../renderer/types/global';

const defaults = {
  shortcut: 'CommandOrControl+B', // 快捷键
  onlyReceive: false, // 只接收
  startUpLogin: false,//开机启动
  listenBoard: false, // 是否监听
  darkMode: false,
  maxSendRecord: 50, // 最大发送记录
  maxReceiveRecord: 50,
};

export const store = {

  getRecord(key: 'send' | 'receive'): Map<string, any> {
    let record = [];
    try {
      const data = fs.readFileSync(this.getStateFile(`${key}MapName`));
      record = this.parseJson(data);
    } catch (err) {
      record = [];
    }
    return new Map(record);
  },
  setRecord(key: 'send' | 'receive' | 'config', val: any) {
    fs.writeFile(this.getStateFile(key), JSON.stringify(val), (err) => {
      if (err) {
        console.error(err);
      }
    });
  },
  getConfig(): ClipConfig {
    let config = null;
    try {
      config = fs.readFileSync(this.getStateFile('config'));
      config = this.parseJson(config);
    } catch (err) {
      config = defaults;
    }
    return {...defaults, ...config};
  },


  getStateFile(fileName: string) {
    const userPath = app.getPath('userData');
    return path.join(userPath, `clipboard-sync-${fileName}.json`);
  },

  parseJson(str: string): ClipConfig {
    let json = null;
    try {
      json = JSON.parse(str);
    } catch (err) {
      json = defaults;
    }

    return json;
  },
};
