import type {DataConnection} from 'peerjs';
import Peer from 'peerjs';
import type {Ref} from 'vue';
import {ref} from 'vue';
import {getPeerId} from './index';
import type {ClipFile} from '../../main/types/global';


export interface TransferData {
  from: string;
  name: string;
  to?: string;
  size: number;
  type: 'text' | 'file';
  content: (string | ClipFile)[];
  date: string;
}

const errors = {
  'browser-incompatible': {
    en: 'The client\'s browser does not support some or all WebRTC features that you are trying to use.',
    zh: '客户端的浏览器不支持您尝试使用的部分或全部 Web RTC 功能。',
  },
  'disconnected': {
    en: 'You\'ve already disconnected this peer from the server and can no longer make any new connections on it.',
    zh: '您已经将此对等点与服务器断开连接。',
  },
  'invalid-id': {
    en: 'The ID passed into the Peer constructor contains illegal characters',
    zh: ' ID 包含非法字符',
  },
  'invalid-key': {
    en: 'The API key passed into the Peer constructor contains illegal characters or is not in the system (cloud server only)',
    zh: '传递到Peer构造函数中的API密钥包含非法字符或不在系统中',
  },
  'network': {
    en: 'Lost or cannot establish a connection to the signalling server.',
    zh: '丢失或无法建立与信令服务器的连接。',
  },
  'peer-unavailable': {
    en: 'The peer you\'re trying to connect to does not exist.',
    zh: '您尝试连接的对等点不存在。',
  },
  'ssl-unavailable': {
    en: 'PeerJS is being used securely, but the cloud server does not support SSL. Use a custom PeerServer.',
    zh: '您尝试连接的对等点不存在。',
  },
  'server-error': {
    en: 'Unable to reach the server.',
    zh: '无法连接服务器。',
  },
  'socket-error': {
    en: 'An error from the underlying socket.',
    zh: '来自底层套接字的错误',
  },
  'socket-closed': {
    en: 'The underlying socket closed unexpectedly.',
    zh: '底层套接字意外关闭。',
  },
  'unavailable-id': {
    en: 'The ID passed into the Peer constructor is already taken.',
    zh: 'ID 已被使用。',
  },
  'webrtc': {
    en: 'Native WebRTC errors.',
    zh: '原生WebRTC错误。',
  },
};

export const usePeer = (receive: (data: any) => void) => {
  const peerId = localStorage.getItem('peerId') || getPeerId();
  const storeId = localStorage.getItem('remotePeerId');
  const msgList: Ref<string[]> = ref([]);
  const connected = ref(false);
  const loading = ref(false);
  const progress = ref(0);
  const remotePeerId = ref(storeId);
  let hostConnection: DataConnection;
  const IDPREFIX = '';
  const peer = new Peer(`${IDPREFIX}${peerId}`, {
    host: 'peer.zeabur.app',
    port: 443,
  });
  peer.on('open', id => {
    msgList.value.push(`已与中继服务器建立连接. 分配Id:${id}`);
    localStorage.setItem('peerId', id);
  });
  peer.on('close', () => {
    console.log('peer-on-close.');
  });
  peer.on('disconnected', () => {
    console.log('peer-on-disconnected.');
  });

  peer.on('error', (err: any) => {
    msgList.value.push(`与id:${hostConnection.peer}连接失败...`);
    msgList.value.push(`失败原因${errors[err.type].zh}`);
    connected.value = false;
  });
  // 远程连接监听
  peer.on('connection', connection => {
    // remoteConnection = connection;
    // 远程连接建立
    connection.on('open', () => {
      join();
      loading.value = false;
      connected.value = true;
    });

    connection.on('data', data => {
      console.log('收到数据',data);
      receive(data);
      // connection.send({data: 'ok', id: peerId});
    });
    connection.on('close', () => {
      console.log(`连接 ${connection.peer} 已关闭.`);
    });
  });


  const reconnect = () => {
    msgList.value = ['重新连接到信号器.'];
    msgList.value.push('◌ 搜索信号器...');
    peer.reconnect();
  };

  const once = (fn: () => void) => {
    let count = 0;
    return function() {
      if (count++ === 0) {
        fn();
      }
    };
  };
  const join = once(() => {
    if (!remotePeerId.value) return;
    hostConnection = hostConnection || peer.connect(`${IDPREFIX}${remotePeerId.value}`, {reliable: true});
    loading.value = true;
    msgList.value.push(`开始建立到 ${remotePeerId.value}的连接`);
    hostConnection.on('open', () => {
      msgList.value.push(`已与远程端点 ${hostConnection.peer} 建立连接 .`);
      connected.value = true;
      loading.value = false;
    });
    hostConnection.on('data', (data) => {
      console.log('host-on-data.', {data});
    });
    hostConnection.on('close', () => {
      msgList.value.push(`远程端点 ${hostConnection.peer} 已关闭连接 .`);
      connected.value = false;
    });
    localStorage.setItem('remotePeerId', remotePeerId.value);
  });

  const send = (data: TransferData) => {
    if (hostConnection) {
      data.to = remotePeerId.value;
      data.from = peerId;
      if (data.type === 'file') {
        data.content = window.electron.getFiles(data.content);
      }
      hostConnection.send(data);
    }
  };

  return {
    msgList,
    connected,
    peerId,
    loading,
    progress,
    remotePeerId,
    reconnect,
    join,
    send,
  };
};
