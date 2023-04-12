import type {DataConnection} from 'peerjs';
import Peer from 'peerjs';
import {getPeerId} from './index';
import {ref} from 'vue';


export const usePeer = (receive: (data: any) => void) => {
  const peerId = getPeerId(5);
  const progress = ref([]);
  const connected = ref(false);
  const loading = ref(false);

  let hostConnection: DataConnection;
  let remoteConnection: DataConnection;
  const IDPREFIX = 'CLIP-ASYNC-';
  const peer = new Peer(`${IDPREFIX}${peerId}`, {
    // host: 'kfwong-server.herokuapp.com',
    // port: 443,
    // path: '/myapp',
    // secure: true,
  });

  peer.on('open', id => {
    progress.value.push('已建立与信号器的连接.');
    progress.value.push(`分配 id: ${id.replace(IDPREFIX, '')}`);
  });

  peer.on('connection', connection => {
    loading.value = true;
    remoteConnection = connection;
    progress.value.push(`${connection.peer} 正在尝试建立连接.`);

    connection.on('open', () => {
      progress.value.push(`连接： ${connection.peer} 已建立.`);
      join(connection.peer);
      loading.value = false;
    });

    connection.on('data', data => {
      console.log('收到数据:\n', data);
      receive(data);
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
  });

  peer.on('error', (err) => {
    console.log(err);
    progress.value.push(`与${hostConnection.peer.replace(IDPREFIX, '')}连接失败...`);
    loading.value = false;
  });

  function reconnect() {
    progress.value = ['重新连接到信号器.'];
    progress.value.push('◌ 搜索信号器...');
    peer.reconnect();
  }

  const join = remoteId => {
    hostConnection = hostConnection || peer.connect(`${IDPREFIX}${remoteId}`);
    loading.value = true;
    hostConnection.on('open', () => {
      progress.value.push(`Connection to ${hostConnection.peer} established.`);
      progress.value.push(`CONNECTED TO ${hostConnection.peer}.`);
      connected.value = true;
      loading.value = false;
    });

    hostConnection.on('data', data => {
      console.log('收到数据:', data);
    });
    hostConnection.on('error', err => {
      console.log('err', err);
    });

    hostConnection.on('close', () => {
      progress.value.push(`Connection to ${hostConnection.peer} is closed.`);
      connected.value = false;
      loading.value = false;

      peer.destroy();
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.electron.store.set('remotePeerId', remoteId);
  };

  function send(data) {
    if (hostConnection) {
      data.to = remoteConnection.peer;
      console.log('发送数据:', data);
      hostConnection.send(data);
    }
  }

  return {
    progress,
    connected,
    peerId,
    loading,
    reconnect,
    join,
    send,
  };
};
