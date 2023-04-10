import Peer from 'peerjs';
import {getDeviceId} from './index';
import {ref} from 'vue';

export const usePeer = (receive: (data: any) => void) => {
  const peerId = getDeviceId(3);
  const progress = ref([]);
  const connected = ref(true);

  let hostConnection;
  let remoteConnection;

  const peer = new Peer(peerId, {
    // host: 'kfwong-server.herokuapp.com',
    // port: 443,
    // path: '/myapp',
    // secure: true,
  });

  peer.on('open', id => {
    progress.value.push('已建立与信号器的连接.');
    progress.value.push(`分配 id: ${id}`);
  });

  peer.on('connection', connection => {
    remoteConnection = connection;
    progress.value.push(`${connection.peer} 正在尝试建立连接.`);

    connection.on('open', () => {
      progress.value.push(`连接： ${connection.peer} 已建立.`);
      join(connection.peer);
    });

    connection.on('data', data => {
      console.log('收到数据:\n', data);
      receive(data);
    });

    connection.on('close', () => {
      console.log(`连接 ${connection.peer} 已关闭.`);
      connected.value = false;
    });
  });

  peer.on('disconnected', () => {
    console.log('与信号器断开连接.');
  });

  peer.on('error', error => {
    console.log(error);
  });

  function reconnect() {
    progress.value = ['重新连接到信号器.'];
    progress.value.push('◌ 搜索信号器...');
    peer.reconnect();
  }

  const join = remoteId => {
    hostConnection =hostConnection|| peer.connect(remoteId);

    hostConnection.on('open', () => {
      progress.value.push(`Connection to ${hostConnection.peer} established.`);
      progress.value.push(`CONNECTED TO ${hostConnection.peer}.`);
      connected.value = true;
    });

    hostConnection.on('data', data => {
      console.log('收到数据:', data);
      // receive(data);
    });

    hostConnection.on('close', () => {
      progress.value.push(`Connection to ${hostConnection.peer} is closed.`);
      connected.value = false;

      peer.destroy();
    });
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
    reconnect,
    join,
    send,
  };
};
