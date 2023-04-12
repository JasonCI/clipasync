import *as path from 'path';
import *as fs from 'fs';

export default (): string => {
  let localDataFile: any = process.env.HOME;
  if (!localDataFile) {
    localDataFile = process.env.LOCALAPPDATA;
  }
  const clipAsyncPath = path.join(localDataFile, 'clip-async');
  if (!fs.existsSync(clipAsyncPath)) {
    fs.mkdirSync(clipAsyncPath);
  }
  return clipAsyncPath;
};
