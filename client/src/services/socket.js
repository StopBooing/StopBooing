import { io } from 'socket.io-client';

// 동적 서버 URL 설정
const getServerUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}`;
};

const SERVER_URL = getServerUrl();
console.log('Socket.IO Server URL:', SERVER_URL);
const socket = io(SERVER_URL, {
  path: '/backend/socket.io',
  transports: ['polling', 'websocket']
});
console.log('Socket instance:', socket);

export default socket;