const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // 클라이언트의 실제 주소로 변경
    methods: ["GET", "POST"]
  }
});

// 클라이언트가 연결되었을 때
io.on('connection', (socket) => {
  console.log(`사용자가 연결되었습니다: ${socket.id}`);

  // 클라이언트로부터 'keyPress' 이벤트를 받았을 때
  socket.on('keyPress', (data) => {
    console.log(`사용자 ${socket.id}가 키를 눌렀습니다: ${data.key}`);

    // 중요: 'playerKeyPress' 이벤트를 자신을 제외한 모든 연결된 클라이언트에게 전송
    // socket.broadcast.emit()을 사용하면 이 이벤트를 보낸 클라이언트(자기 자신)를 제외하고 보냅니다.
    io.emit('playerKeyPress', { playerId: socket.id, key: data.key }); // 모든 클라이언트에게 전송 (자신 포함)
    // 또는: socket.broadcast.emit('playerKeyPress', { playerId: socket.id, key: data.key }); // 자신 제외하고 전송
  });

  // 클라이언트의 연결이 끊어졌을 때
  socket.on('disconnect', () => {
    console.log(`사용자 연결이 끊어졌습니다: ${socket.id}`);
    // 옵션: 연결 끊김 정보를 다른 플레이어에게 알릴 수도 있습니다.
    // io.emit('playerDisconnected', { playerId: socket.id });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});