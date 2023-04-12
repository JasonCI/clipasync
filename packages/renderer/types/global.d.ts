declare global {
  interface Window {
    electron: IMessageAPI;
  }
}

export interface IMessageAPI {
  onClipboard: (cb:any) => void;
  setClipboard: (data: any) => void;
  store: {
    get: (key: string) => any;
    set: (key: string, val: any) => void;
    // any other methods you've defined...
  };
}
