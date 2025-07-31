const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// CORS 설정 - 프로덕션과 개발 환경 모두 지원
const allowedOrigins = [
  'http://localhost:5173',
  'http://172.20.12.65',
  'https://172.20.12.65',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({ 
  origin: function (origin, callback) {
    // origin이 없는 경우 (모바일 앱, Postman 등) 허용
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단됨'));
    }
  },
  credentials: true 
}));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

let users = []; // { id: socket.id, nickname: '닉네임', instrument: '악기명' }
let selectedInstruments = {}; // { instrument: socket.id } - 어떤 악기가 누구에게 선택되었는지
let globalCombo = 0; // 전체 클라이언트의 종합 콤보

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
    console.log('check_nickname', nickname);
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

  // 악기 선택 이벤트
  socket.on('select_instrument', (instrument) => {
    console.log(`사용자 ${socket.id}가 악기 ${instrument}를 선택했습니다.`);
    
    // 이미 선택된 악기인지 확인
    if (selectedInstruments[instrument]) {
      socket.emit('instrument_already_taken', instrument);
      console.log(`악기 ${instrument}는 이미 선택되었습니다.`);
      return;
    }
    
    // 이전에 선택한 악기가 있다면 해제
    const previousInstrument = Object.keys(selectedInstruments).find(key => selectedInstruments[key] === socket.id);
    if (previousInstrument) {
      delete selectedInstruments[previousInstrument];
      console.log(`이전 악기 ${previousInstrument} 선택 해제`);
    }
    
    // 새 악기 선택
    selectedInstruments[instrument] = socket.id;
    
    // 유저 정보 업데이트
    const userIndex = users.findIndex(u => u.id === socket.id);
    if (userIndex !== -1) {
      users[userIndex].instrument = instrument;
    }
    
    // 모든 클라이언트에게 악기 선택 상태 브로드캐스트
    io.emit('instrument_selected', {
      playerId: socket.id,
      instrument: instrument,
      selectedInstruments: selectedInstruments
    });
    
    console.log('현재 선택된 악기들:', selectedInstruments);
  });

  // 악기 선택 해제 이벤트
  socket.on('deselect_instrument', (instrument) => {
    console.log(`사용자 ${socket.id}가 악기 ${instrument} 선택을 해제했습니다.`);
    
    if (selectedInstruments[instrument] === socket.id) {
      delete selectedInstruments[instrument];
      
      // 유저 정보에서 악기 제거
      const userIndex = users.findIndex(u => u.id === socket.id);
      if (userIndex !== -1) {
        delete users[userIndex].instrument;
      }
      
      // 모든 클라이언트에게 악기 선택 해제 브로드캐스트
      io.emit('instrument_deselected', {
        playerId: socket.id,
        instrument: instrument,
        selectedInstruments: selectedInstruments
      });
      
      console.log('현재 선택된 악기들:', selectedInstruments);
    }
  });

  socket.on('ready', () => {
    // 모든 플레이어가 악기를 선택했는지 확인
    const playersWithInstruments = users.filter(user => user.instrument);
    const totalPlayers = users.length;
    const playersWithInstrumentsCount = playersWithInstruments.length;
    
    console.log(`게임 시작 시도: ${playersWithInstrumentsCount}/${totalPlayers} 플레이어가 악기를 선택함`);
    
                   // 최소 2명 이상이고, 모든 플레이어가 악기를 선택했을 때만 게임 시작
               if (totalPlayers >= 2 && playersWithInstrumentsCount === totalPlayers) {
                 // 게임 시작 시 콤보 초기화
                 globalCombo = 0;
                 console.log('게임 시작 - 콤보 초기화:', globalCombo);
                 
                 io.emit('game_start', {
                   users: users,
                   globalCombo: globalCombo
                 });
                 console.log('게임 시작! 모든 플레이어가 준비됨');
               } else {
      // 조건이 충족되지 않으면 시작 시도한 플레이어에게 알림
      socket.emit('game_start_failed', {
        message: `게임을 시작하려면 최소 2명 이상의 플레이어가 모두 악기를 선택해야 합니다. (현재: ${playersWithInstrumentsCount}/${totalPlayers})`
      });
      console.log('게임 시작 실패: 조건 미충족');
    }
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

  socket.on('HITfromCLIENT',(type)=>{
    console.log('HITfromCLIENT',type);
    console.log('서버: 각 컴포넌트별 이벤트 브로드캐스트 전송 - type:', type);
    
    // 각 컴포넌트별로 다른 이벤트 이름으로 브로드캐스트
    io.emit('HITfromSERVER_DRUM', type);
    io.emit('HITfromSERVER_GUITAR', type);
    io.emit('HITfromSERVER_VOCAL', type);
    io.emit('HITfromSERVER_KEYBOARD', type);
  });

  // 정확도 동기화 이벤트
  socket.on('note_accuracy', (data) => {
    console.log(`정확도 브로드캐스트: ${data.instrument} - ${data.accuracy}`);
    
    // 모든 클라이언트에게 해당 악기의 정확도 브로드캐스트
    io.emit('player_accuracy', {
      instrument: data.instrument,
      lane: data.lane,
      accuracy: data.accuracy,
      serverTime: data.serverTime,
      playerId: socket.id
    });
  });

  // Miss 동기화 이벤트
  socket.on('note_miss', (data) => {
    console.log(`Miss 브로드캐스트: ${data.instrument} - 레인 ${data.lane}`);
    
    // 전체 콤보 초기화 (miss 시)
    globalCombo = 0;
    console.log(`전체 콤보 초기화 (miss): ${globalCombo}`);
    
    // 모든 클라이언트에게 해당 악기의 miss 정보와 업데이트된 콤보 브로드캐스트
    io.emit('player_miss', {
      instrument: data.instrument,
      lane: data.lane,
      serverTime: data.serverTime,
      playerId: socket.id,
      globalCombo: globalCombo
    });
  });

  // 콤보 업데이트 이벤트
  socket.on('combo_update', (data) => {
    console.log(`콤보 업데이트: ${data.instrument} - ${data.accuracy}`);
    
    // perfect, good, bad인 경우 콤보 증가
    if (data.accuracy === 'perfect' || data.accuracy === 'good' || data.accuracy === 'bad') {
      globalCombo++;
      console.log(`전체 콤보 증가: ${globalCombo}`);
    }
    
    // 모든 클라이언트에게 업데이트된 콤보 브로드캐스트
    io.emit('global_combo_update', {
      globalCombo: globalCombo,
      lastAccuracy: data.accuracy,
      lastInstrument: data.instrument
    });
  });

  socket.on('ACCURACYfromCLIENT',(data)=>{
    console.log('ACCURACYfromCLIENT',data);
  });

  socket.on('keyPress', (data) => {
    console.log(`사용자 ${socket.id}가 키를 눌렀습니다: ${data.key}`);

    // 중요: 'playerKeyPress' 이벤트를 자신을 제외한 모든 연결된 클라이언트에게 전송
    // socket.broadcast.emit()을 사용하면 이 이벤트를 보낸 클라이언트(자기 자신)를 제외하고 보냅니다.
    io.emit('playerKeyPress', { playerId: socket.id, key: data.key }); // 모든 클라이언트에게 전송 (자신 포함)
    // 또는: socket.broadcast.emit('playerKeyPress', { playerId: socket.id, key: data.key }); // 자신 제외하고 전송
  });

  socket.on('disconnect', () => {
    // 연결 해제 시 선택한 악기도 해제
    const selectedInstrument = Object.keys(selectedInstruments).find(key => selectedInstruments[key] === socket.id);
    if (selectedInstrument) {
      delete selectedInstruments[selectedInstrument];
      io.emit('instrument_deselected', {
        playerId: socket.id,
        instrument: selectedInstrument,
        selectedInstruments: selectedInstruments
      });
    }
    
    users = users.filter(u => u.id !== socket.id);
    delete votes[socket.id];
    console.log('클라이언트 연결 해제:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io 서버가 ${PORT}번 포트에서 실행 중`);
});
