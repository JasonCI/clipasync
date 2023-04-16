// declare global {
//   namespace NodeJS {
//     interface Global {
//       OP_CONFIG: any;
//     }
//   }
// }
//
// export {};

/* eslint-disable no-var */
declare global {
  var OP_CONFIG: ClipConfig;
}

interface ClipConfig {
  config: null;

  get(): () => ClipConfig;

  set(value: any): void;
}

export interface ClipFile {
  data: Buffer;
  path: string;
  date: string;
  size: number;
  name: string;
  ext: string;
}

export {};
