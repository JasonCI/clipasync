import * as clipboardEx from 'electron-clipboard-ex';
import type {Stats} from 'fs';
import * as fs from 'fs';
import {app, clipboard} from 'electron';
import * as robot from 'robotjs';
import * as path from 'path';
import * as process from 'process';
import type {ClipFile} from '../../types/global';

const getFilesStat = async (paths: string[]) => {
  return Promise.all(paths.map(p => readFileStat(p)));
};
export const getFiles = async (stats: ClipFile[]) => {
  return Promise.all(stats.map(s => readFile(s)));
};

export const writeToClipboard = (data: any) => {
  console.log({ data});
  if (data.type === 'text') {
    clipboard.writeText(data.content);
  }
  if (data.type === 'file') {
    const files = data.content;
    const filePaths: string[] = [];
    files.forEach((file: any) => {
      const {data: buffer, name} = file;
      const buffers = Buffer.from(buffer, 'utf8');
      const dataPath = path.join(app.getPath('temp'), name);
      console.log(dataPath);
      fs.writeFile(dataPath, buffers, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
      filePaths.push(dataPath);
    });
    clipboardEx.writeFilePaths(filePaths);
    return filePaths;
  }

};

const readFileStat = (p: string) => {
  return new Promise((resolve, reject) => {
    fs.stat(p, (err: NodeJS.ErrnoException | null, stats: Stats) => {
      if (err) reject(err);
      const date = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
      if (!stats || stats.isDirectory()) {
        resolve(null);
        return;
      }
      if (stats.isFile()) {
        resolve({
          path: p,
          date,
          size: stats.size,
          name: path.basename(p),
          ext: path.extname(p),
        });
      }
    });
  });
};

const readFile = async (stat: ClipFile): Promise<ClipFile> => {
  return new Promise((resolve, reject) => {
    fs.readFile(stat.path, (err: NodeJS.ErrnoException | null, data: Buffer) => {
      if (err) reject(err);
      resolve({
        ...stat,
        data,
      });
    });
  });
};

// const isMac = () => process.platform == 'darwin';
// const isWin = () => process.platform == 'win32';
// const isLin = () => process.platform == 'linux';
//
// 获取剪切板上文件路径
export const getClipboardContent = async () => {
  // 用于存放剪切板上的文件路径集合
  // let filePath: string[] = [];
  // if (isMac()) { // 若当前在mac系统中
  //   if (clipboard.has('NSFilenamesPboardType')) { // 若存在多个文件
  //     const tagContent = clipboard.read('NSFilenamesPboardType').match(/<string>.*<\/string>/g);
  //     filePath = tagContent ? tagContent.map(item => item.replace(/<string>|<\/string>/g, '')) : [];
  //   } else { // 仅单个文件的时候
  //     filePath = [clipboard.read('public.file-url').replace('file://', '')].filter(item => item);
  //   }
  // } else { // 若当前在windows系统中
  //   if (clipboard.has('CF_HDROP')) { // 若剪切板上有多个文件
  //     const rawFilePathStr = clipboard.readBuffer('CF_HDROP').toString('ucs2') || '';
  //     let formatFilePathStr = [...rawFilePathStr]
  //       .filter((_, index) => rawFilePathStr.charCodeAt(index) !== 0)
  //       .join('')
  //       .replace(/\\/g, '\\');
  //
  //     const drivePrefix = formatFilePathStr.match(/[a-zA-Z]:\\/);
  //
  //     if (drivePrefix) {
  //       const drivePrefixIndex = formatFilePathStr.indexOf(drivePrefix[0]);
  //       if (drivePrefixIndex !== 0) {
  //         formatFilePathStr = formatFilePathStr.substring(drivePrefixIndex);
  //       }
  //       filePath = formatFilePathStr
  //         .split(drivePrefix[0])
  //         .filter(item => item)
  //         .map(item => drivePrefix + item);
  //     }
  //   } else { // 若为单个文件
  //     filePath = [
  //       clipboard.readBuffer('FileNameW').toString('ucs2').replace(RegExp(String.fromCharCode(0), 'g'), ''),
  //     ].filter(item => item);
  //   }
  // }
  const filePaths = clipboardEx.readFilePaths();
  return new Promise(resolve => {
    // console.log({filePath,filePaths});
    if (filePaths.length > 0) {
      getFilesStat(filePaths).then(files => {
        files = files.filter(f => !!f);
        resolve({
          type: 'file',
          content: files,
        });
      });
      return;
    }
    const text = clipboard.readText();
    if (text) {
      resolve({
        type: 'text',
        content: text,
      });
      return;
    }
    // 剪贴板为空
    resolve({
      type: 'empty',
      content: '',
    });
  });
};

export const getClipboardText = async () => {
  return new Promise(resolve => {
    // 缓存之前的文案
    const lastText = clipboard.readText('clipboard');

    const platform = process.platform;

    if (platform === 'darwin') {
      robot.keyTap('c', 'command');
    } else {
      robot.keyTap('c', 'control');
    }

    setTimeout(() => {
      // 读取剪切板内容
      const text = clipboard.readText('clipboard') || '';
      const rawFilePath = clipboard.readBuffer('FileNameW').toString('ucs2');
      const filePath = rawFilePath.replace(new RegExp(String.fromCharCode(0), 'g'), '');

      // 恢复剪切板内容
      clipboard.writeText(lastText);

      resolve({
        text,
        filePath,
      });
    }, 300);
  });
};
