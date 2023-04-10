declare global {
  interface Window {
    electron: IMessageAPI;
  }
}
 export interface IMessageAPI {
   onClipboard: (cb:any) => void;
   setClipboard: (data: any) => void
 }
