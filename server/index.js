// index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({ origin: 'http://localhost:5174', credentials: true }));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 3001;

let users = []; // { id: socket.id, nickname: '닉네임' }

app.use(express.json());

app.get('/api/users', (req, res) => {
  res.json({ users })
});

app.get('/api/songs', (req, res) => {
  const songs = JSON.parse(fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8'));
  res.json({ songs });
});

let votes = {}; // { socket.id: songId }

io.on('connection', (socket) => {
  console.log('클라이언트 접속:', socket.id);

  socket.on('check_nickname', (nickname) => {
    if(users.length >= 5) {
      socket.emit('room_already_full');
      console.log('방이 꽉 찼습니다 IN SERVER.');
      return;
    }
    // 이미 등록된 유저면 무시
    if (!users.find(u => u.nickname === nickname)) {
      users.push({ id: socket.id, nickname });
      console.log('닉네임 등록:', nickname, users.length + '명');
      socket.emit('nickname_registered', nickname);
    }
    else {
      socket.emit('nickname_already_taken');
      console.log('닉네임 이미 사용중, nickname : ', nickname);
    }
  });
  socket.on('ready', () => {
    io.emit('game_start', users);
    console.log('게임 시작!');
  });

  socket.on('vote_song', (songId) => {
    votes[socket.id] = songId;
    // 모든 유저가 투표했는지 확인
    if (Object.keys(votes).length === users.length && users.length > 0) {
      // 다수결 집계
      const count = {};
      Object.values(votes).forEach(id => { count[id] = (count[id] || 0) + 1; });
      // 최다 득표 곡 선정
      const maxVotes = Math.max(...Object.values(count));
      const winners = Object.keys(count).filter(id => count[id] === maxVotes);
      const selectedSongId = winners[0]; // 동점이면 첫 번째 곡
      io.emit('song_selected', selectedSongId);
      votes = {}; // 투표 초기화
    }
  });

  socket.on('disconnect', () => {
    users = users.filter(u => u.id !== socket.id);
    delete votes[socket.id];
    console.log('클라이언트 연결 해제:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io 서버가 ${PORT}번 포트에서 실행 중`);
});
