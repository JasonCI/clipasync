import type {DataConnection} from 'peerjs';
import Peer from 'peerjs';
import {getPeerId} from './index';
import {ref} from 'vue';


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
  const peerId = localStorage.getItem('peerId') || getPeerId(5);
  const storeId = localStorage.getItem('remotePeerId');
  const msgList = ref([]);
  const connected = ref(false);
  const loading = ref(false);
  const progress = ref(0);
  const remotePeerId = ref(storeId);
  let startTime = 0;
  let bytesTransferred = 0;

  let hostConnection: DataConnection;
  let remoteConnection: DataConnection;
  const IDPREFIX = '';
  const peer = new Peer(`${IDPREFIX}${peerId}`, {
    host: 'peer.zeabur.app',
    port: 443,
  });
  peer.on('open', id => {
    msgList.value.push('已建立与信号器的连接.');
    msgList.value.push(`分配 id: ${id.replace(IDPREFIX, '')}`);
    localStorage.setItem('peerId', id);
    join();
  });

  peer.on('connection', connection => {
    loading.value = true;
    remoteConnection = connection;
    msgList.value.push(`${connection.peer} 正在尝试建立连接.`);

    connection.on('open', () => {
      msgList.value.push(`已成功建立对接点连接： ${connection.peer} `);
      loading.value = false;
    });

    connection.on('data', data => {
      console.log('收到数据:\n', data);
      receive(data);
      bytesTransferred += data.length;
      if (startTime === 0) {
        startTime = Date.now();
      }
      const elapsedTime = (Date.now() - startTime) / 1000;
      const speed = bytesTransferred / elapsedTime;
      console.log('transfer speed: ' + speed + ' bytes/s');
    });
    connection.on('close', () => {
      console.log(`连接 ${connection.peer} 已关闭.`);
      connected.value = false;
      loading.value = false;
    });
  });

  peer.on('disconnected', () => {
    console.log('与信号器断开连接.');
    loading.value = false;
    connected.value = false;
    peer.reconnect();
  });

  peer.on('error', (err) => {
    msgList.value.push(`与id:${hostConnection.peer.replace(IDPREFIX, '')}连接失败...`);
    msgList.value.push(`失败原因${errors[err.type].zh}`);
    loading.value = false;
  });


  function reconnect() {
    msgList.value = ['重新连接到信号器.'];
    msgList.value.push('◌ 搜索信号器...');
    peer.reconnect();
  }

  const join = () => {
    if (!remotePeerId.value) return;
    localStorage.setItem('remotePeerId', remotePeerId.value);
    msgList.value.push(`开始连接到 ${remotePeerId.value}.`);
    hostConnection = hostConnection || peer.connect(`${IDPREFIX}${remotePeerId.value}`, {reliable: true});
    loading.value = true;
    hostConnection.on('open', () => {
      msgList.value.push(`已连接到 ${hostConnection.peer}.`);
      connected.value = true;
      loading.value = false;
    });

    // hostConnection.on('data', data => {
    //   console.log('收到数据:', data);
    // });
    // hostConnection.on('error', err => {
    //   console.log('err', err.type);
    // });
    //
    hostConnection.on('close', () => {
      msgList.value.push(`Connection to ${hostConnection.peer} is closed.`);
      connected.value = false;
      loading.value = false;

      peer.destroy();
    });
    // setInterval(function() {
    //   console.log('transfer msgList: ' + 0 + '%');
    //   const dataChannel = hostConnection.dataChannel;
    //   console.log(dataChannel.bufferedAmount, dataChannel.bufferedAmountLowThreshold);
    //   // progress.value = 100 * (1 - dataChannel.bufferedAmount / dataChannel.bufferedAmountLowThreshold);
    //   // console.log('transfer msgList: ' + progress.value + '%');
    // }, 1000);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    localStorage.setItem('remotePeerId', remotePeerId.value);
    // localStorage.setItem('remotePeerId', remoteId);
  };

  function send(data) {
    if (hostConnection) {
      data.to = remoteConnection.peer;
      console.log('发送数据:', data);
      hostConnection.send(data, true);
      startTime = 0;
      bytesTransferred = 0;
    }
  }

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
