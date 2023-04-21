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
  getRecord(key: 'send' | 'receive') {
    let val: any = getFile(fPath(key));
    try {
      val = JSON.parse(val);
      if (val) val = new Map(val);
    } catch (e) {
      val = new Map();
    }
    return val;
  },
  setFile(key: 'send' | 'receive' | 'config', val: any) {
    fs.writeFile(fPath(key), val, (err) => {
      if (err) {
        console.error(err);
      }
    });
  },
  delRecord(record: any) {
    if (record.type === 'file') {
      record.content.forEach((f:File)=>{
        fs.unlink(f.path, (err) => {
          if (err) {
            console.error(err);
          }
        });
      });

    }
  },
  getConfig(): ClipConfig {
    let config:any = null;
    try {
      config = getFile(fPath('config'));
      if (config) config = JSON.parse(config);
    } catch (err) {
      config = defaults;
    }
    return {...defaults, ...config};
  },

};

const getFile = (path: string) => {
  let file = null;
  try {
    file = fs.readFileSync(path);
  } catch (err) {
    file = null;
  }
  return file;
};

const fPath = (key: string) => {
  const userPath = app.getPath('userData');
  console.log(userPath);
  return path.join(userPath, `clipboard-sync-${key}.json`);
};
