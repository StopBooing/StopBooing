import Phaser from 'phaser';
import * as Tone from 'tone';
import Piano from '../instruments/Piano.js';
import ElectricGuitar from '../instruments/ElectricGuitar.js';

// 악보 데이터를 클래스 외부에 정의합니다.
const pianoSongData = [
  {
    section: 'Verse 1', startBar: 1, endBar: 1, // 첫 마디
    keyMappings: { '8': ['C4', 'E4', 'G4'] },
    timingGuide: [
      { time: '0:1:0', key: '8' }, // 1마디 1박
      { time: '0:2:0', key: '8' }, // 1마디 2박
      { time: '0:3:0', key: '8' }, // 1마디 3박
      { time: '0:4:0', key: '8' }, // 1마디 4박
    ]
  },
  {
    section: 'Verse 1', startBar: 2, endBar: 2, // 두 번째 마디
    keyMappings: { '9': ['C4', 'F4', 'A4'] },
    timingGuide: [
      { time: '0:1:0', key: '9' },
      { time: '0:2:0', key: '9' },
      { time: '0:3:0', key: '9' },
      { time: '0:4:0', key: '9' },
    ]
  },
  {
    section: 'Verse 1', startBar: 3, endBar: 3,
    keyMappings: { '8': ['C4', 'E4', 'G4'] },
    timingGuide: [
      { time: '0:1:0', key: '8' },
      { time: '0:2:0', key: '8' },
      { time: '0:3:0', key: '8' },
      { time: '0:4:0', key: '8' },
    ]
  },
  {
    section: 'Verse 1', startBar: 4, endBar: 4,
    keyMappings: { '9': ['C4', 'F4', 'A4'] },
    timingGuide: [
      { time: '0:1:0', key: '9' },
      { time: '0:2:0', key: '9' },
      { time: '0:3:0', key: '9' },
      { time: '0:4:0', key: '9' },
    ]
  },
  {
    section: 'Verse 1', startBar: 5, endBar: 8,
    keyMappings: { ')': ['G4', 'C5', 'E5'],
      '0': ['E5'],
      '9': ['D5'],
      '8': ['C5'],
      '(': [{ time: '0:4.25:0', chord: ['D5','A4','E4']},
            { time: '0:6.75:0', chord: ['Ab4','B4','D5']},
            { time: '0:8.25:0', chord: ['F4','A4','D5']}
          ],
      '7': ['A4'],
      '6': ['G4'],
      '&': ['C4','E4','A4'],
      '^': ['B4','D4','G4'],
    },
    timingGuide: [
      { time: '0:1:0', key: 'shift+0' },
      { time: '0:1.25:0', key: '9' },
      { time: '0:1.75:0', key: '9' },
      { time: '0:2.5:0', key: '8' },
      { time: '0:2.75:0', key: '9' },
      { time: '0:3.25:0', key: '8' },
      { time: '0:3.75:0', key: '0' },
      { time: '0:4.25:0', key: 'shift+9' },
      { time: '0:5:0', key: '8' },
      { time: '0:5.25:0', key: '7' },

      { time: '0:6.25:0', key: '9' },
      { time: '0:6.5:0', key: '8' },
      { time: '0:6.75:0', key: 'shift+9' },
      { time: '0:7.25:0', key: '8' },
      { time: '0:7.5:0', key: '0' },
      { time: '0:8.25:0', key: 'shift+9' },
      { time: '0:9:0', key: '8' },
      { time: '0:9.25:0', key: '7' },
      { time: '0:11.5:0', key: '7' },
      { time: '0:11.75:0', key: '8' },
      { time: '0:12:0', key: '7' },
      { time: '0:12.25:0', key: '8' },
      { time: '0:12.75:0', key: '7' },
      { time: '0:13:0', key: '8' },
      { time: '0:13.5:0', key: '7' },
      { time: '0:13.75:0', key: '6' },
      { time: '0:15.25:0', key: 'shift+7' },
      { time: '0:16.25:0', key: 'shift+6' }
    ]
  }
];

const electricGuitarSongData = [
  {
    section: 'Intro Riff', startBar: 1, endBar: 4,
    keyMappings: {
      '1': ['C3'],  // C3을 1번 키에 매핑
      '2': ['E3'],  // E3을 2번 키에 매핑
      '3': ['F3'],  // F3을 3번 키에 매핑
      '4': ['G3'],  // G3을 4번 키에 매핑
      'r': ['A#3'], // A#3을 r 키에 매핑
      'e': ['E4'],  // E4를 e 키에 매핑 (기존 로직 유지)
      't': ['F#4'], // F#4를 t 키에 매핑 (기존 로직 유지)
    },
    timingGuide: [
      { time: '0:1:0', key: '1' }, { time: '0:2:0', key: '2' }, { time: '0:3:0', key: '3' }, { time: '0:4:0', key: '4' },
      { time: '1:1:0', key: 'r' }, { time: '1:2:0', key: '2' }, { time: '1:3:0', key: '3' }, { time: '1:4:0', key: '4' },
      { time: '2:1:0', key: 'e' }, { time: '2:2:0', key: 't' }, { time: '2:3:0', key: '3' }, { time: '2:4:0', key: '4' },
      { time: '3:1:0', key: '1' }, { time: '3:2:0', key: '2' }, { time: '3:3:0', key: '3' }, { time: '3:4:0', key: 'r' },
    ]
  }
];

// 악기별 악보 데이터를 하나로 묶습니다.
const songDataRepository = {
  keyboard: pianoSongData, // 키보드는 pianoSongData를 사용
  electric_guitar: electricGuitarSongData,
};


export default class JamScene extends Phaser.Scene {
  constructor() {
    super({ key: 'JamScene' });
    this.bpm = 84;
    this.socket = null;
    this.myInstrumentName = null; // 'keyboard', 'electric_guitar' 등
    this.activeInstrument = null; // 현재 활성화된 악기 컨트롤러 인스턴스
    this.pressedKeys = {};
    this.songDataRepo = songDataRepository;
    this.songData = [];
    this.currentBar = 0; // 마디 추적: 0부터 시작하도록 변경하여 Tone.Transport와 일치시킴
    this.barText = null;
    this.progressBar = null;
    this.progressBarBg = null;
    // this.barStartTime = 0; // 이제 Tone.Transport.position을 직접 사용
    this.barDuration = 0;
    this.HIT_LINE_Y = 500;
    this.SPAWN_Y = 100;
    this.noteSpeed = 0;
    this.scheduledNotes = []; // { key, hitTime, visualObject } 형태로 저장
    this.keyPositions = {};
    this.isBarTransitioning = false; // 마디 트랜지션 중복 방지
  }

  init() {
    this.myInstrumentName = this.sys.game.registry.get('myInstrument');
    this.socket = this.sys.game.registry.get('socket');
    console.log(`JamScene: 나의 역할은 [${this.myInstrumentName}] 입니다.`);
  }

  preload() {
    this.load.image('electric_guitar', 'assets/guitar.png');
    this.load.image('bass', 'assets/guitar.png');
    this.load.image('drums', 'assets/guitar.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#2d2d2d');
    this.myInstrumentName = this.game.registry.get('myInstrument');
    this.songData = this.songDataRepo[this.myInstrumentName] || [];

    console.log(`JamScene: 나의 역할은 [${this.myInstrumentName}] 입니다.`);

    this.createInstrument(); // 악기 컨트롤러 생성
    this.setupKeyboardInput();
    this.setupTimingGuideUI();
  }

  async initToneAudio() {
    if (Tone.context.state === 'suspended') {
      await Tone.start();
      console.log('Tone.js 오디오 컨텍스트 시작됨');
    }
  }

  createInstrument() {
    switch (this.myInstrumentName) {
      case 'keyboard':
        this.activeInstrument = new Piano(this);
        break;
      case 'electric_guitar':
        this.activeInstrument = new ElectricGuitar(this);
        break;
      // 다른 악기들도 여기에 추가
      default:
        this.add.text(400, 300, `알 수 없는 악기: ${this.myInstrumentName}`, { fontSize: '24px', color: '#ff0000' }).setOrigin(0.5);
        return;
    }
    // 악기 UI 생성 및 샘플 로드를 시작합니다.
    this.activeInstrument.createUI();
  }

  setupTimingGuideUI() {
    // 가로 방향 리듬게임으로 변경
    this.HIT_LINE_X = 150;  // 기준선의 X 위치 (화면 왼쪽)
    this.SPAWN_X = this.cameras.main.width - 100; // 노트 생성 위치 (화면 오른쪽)
    this.noteSpeed = 0;

    // 기준선 (수직선) 생성 - y좌표를 0부터 시작하도록 조정
    this.add.line(0, 0, this.HIT_LINE_X, 0, this.HIT_LINE_X, this.cameras.main.height, 0xffffff, 3).setOrigin(0);

    this.noteVisualsGroup = this.add.group();

    // 키별 Y축 위치 매핑 (각 키마다 다른 레인)
    this.keyLanes = {
      // 피아노 키들
      '8': 80, '9': 110, '0': 140, '7': 50,
      '*': 80, '(': 110, ')': 140, '&': 50, '^': 170,
      'shift+0':140,
      'shift+7': 50,
      'shift+6': 20,
      // 일렉기타 키들
      // '1': 50,
      // '2': 110,
      // '3': 170,
      // '4': 230,
      // 'r': 290,
      // 'e': 350,
      // 't': 410,
    };

    // === 보조선(가로선) 추가 ===
    const laneYSet = new Set(Object.values(this.keyLanes));
    laneYSet.forEach(y => {
      this.add.line(
        0, 0,
        this.HIT_LINE_X, y, this.SPAWN_X, y,
        0xcccccc, 0.5 // 연한 회색, 반투명
      ).setOrigin(0);
    });
  }

  startSongTracker() {
    // 이전에 예약된 이벤트가 있다면 모두 제거하여 중복 실행을 방지합니다.
    Tone.Transport.clear();
    Tone.Transport.stop();
    Tone.Transport.cancel(0);

    this.currentBar = 0;
    this.createProgressBar();

    const bpm = 84;
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.timeSignature = 4;
    this.barDuration = Tone.Time('1m').toSeconds();

    // 노트가 화면을 가로질러 이동하는 시간을 설정합니다.
    this.previewTimeSec = 3; // 3초 동안 오른쪽에서 왼쪽으로 이동
    const travelDistance = this.SPAWN_X - this.HIT_LINE_X;
    this.noteSpeed = travelDistance / this.previewTimeSec;

    // 각 마디의 시작 시점에 해당 마디의 노트를 스케줄링합니다.
    this.songData.forEach(barData => {
      const transportBarIndex = barData.startBar - 1;

      Tone.Transport.schedule((time) => {
        this.isBarTransitioning = true;

        Tone.Draw.schedule(() => {
          this.currentBar = transportBarIndex;
          console.log(`현재 마디: ${this.currentBar + 1} (Transport: ${Tone.Transport.position})`);
          if (this.barText) {
            this.barText.setText(`마디: ${this.currentBar + 1}`);
          }

          this.scheduledNotes = this.scheduledNotes.filter(note => note.visualObject && note.visualObject.active);
          this.scheduleVisualNotesForBar(barData, time);
          this.isBarTransitioning = false;
        }, time);
      }, `${transportBarIndex}m`);
    });

    Tone.Transport.start();
  }

  scheduleVisualNotesForBar(barData, barStartAudioTime) {
    barData.timingGuide.forEach(note => {
      const relativeSec = Tone.Time(note.time).toSeconds();
      const hitTime = barStartAudioTime + relativeSec;
      const spawnTime = hitTime - this.previewTimeSec;

      const nowAudio = Tone.now();
      const delaySec = spawnTime - nowAudio;

      const spawnNote = () => {
        const vis = this.spawnNoteVisual(note);
        this.scheduledNotes.push({ hitTime, visualObject: vis });
      };

      if (delaySec <= 0) {
        spawnNote();
      } else {
        this.time.delayedCall(delaySec * 1000, spawnNote, [], this);
      }
    });
  }

  spawnNoteVisual(note) {
    const yPos = this.keyLanes[note.key] || this.cameras.main.height / 2;

    // 노트 블록 생성 (가로로 긴 형태)
    const noteBlock = this.add.rectangle(0, 0, 100, 20, 0x00ff00).setOrigin(0.5);
    const keyText = this.add.text(0, 0, note.key.toUpperCase(), {
      fontSize: '18px',
      color: '#000000',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 컨테이너를 화면 오른쪽에서 시작하도록 설정
    const container = this.add.container(this.SPAWN_X, yPos, [noteBlock, keyText]);
    this.noteVisualsGroup.add(container);
    return container;
  }

  startCountdown() {
    let count = 3;
    const countdownText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, count, { fontSize: '96px', color: '#fff' })
      .setOrigin(0.5);

    const timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        count--;
        if (count > 0) {
          countdownText.setText(count);
        } else {
          countdownText.destroy();
          timer.remove();
          this.startSongTracker();
        }
      },
      callbackScope: this,
      repeat: 2
    });
  }
  
  createProgressBar() {
    this.progressBarWidth = 300;
    this.progressBarHeight = 20;
    this.progressBarX = (this.sys.game.config.width - this.progressBarWidth) / 2;
    this.progressBarY = 20; // 화면 상단에 붙이기 위해 y좌표를 20으로 조정

    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x555555, 1);
    this.progressBarBg.fillRect(this.progressBarX, this.progressBarY, this.progressBarWidth, this.progressBarHeight);

    this.progressBar = this.add.graphics();
  }

  setupKeyboardInput() {
    this.input.keyboard.on('keydown', (event) => {
      event.preventDefault();

      const code = event.code;
      if (this.pressedKeys[code] || !this.activeInstrument) {
        return;
      }

      const keyId = this.getKeyIdentifier(event);
      if (!keyId) return;

      const currentSection = this.songData.find(s => this.currentBar + 1 >= s.startBar && this.currentBar + 1 <= s.endBar);
      if (!currentSection || !currentSection.keyMappings) return;

      const mapping = currentSection.keyMappings[keyId];
      if (!mapping) return;

      let chordToPlay = null;

      if (Array.isArray(mapping) && mapping.length > 0 && typeof mapping[0] === 'object') {
        const barStartTime = Tone.Time(`${this.currentBar}m`).toSeconds();
        const timeInBar = Tone.Transport.seconds - barStartTime;
        for (let i = mapping.length - 1; i >= 0; i--) {
          const timedChord = mapping[i];
          if (timedChord && timedChord.time) {
            const mappingTime = Tone.Time(timedChord.time).toSeconds();
            if (timeInBar >= mappingTime) {
              chordToPlay = timedChord.chord;
              break;
            }
          }
        }
      } else if (Array.isArray(mapping)) {
        chordToPlay = mapping;
      }

      if (chordToPlay && this.activeInstrument) {
        // activeInstrument에게 연주를 명령합니다.
        this.activeInstrument.handleAttack(chordToPlay);
        this.pressedKeys[code] = { keyId, chord: chordToPlay };
        console.log(`마디 ${this.currentBar + 1}: ${keyId} -> Attack: ${chordToPlay.join(', ')}`);
      } else {
        console.warn(`No valid chord found for key '${keyId}' at this time.`);
      }
    });

    this.input.keyboard.on('keyup', (event) => {
      const code = event.code;

      // Shift 또는 Control 키에서 손을 떼면, 해당 조합으로 눌렀던 모든 소리를 멈춥니다.
      if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'ControlLeft' || code === 'ControlRight') {
        const modifierPrefix = code.includes('Shift') ? 'shift+' : 'ctrl+';
        
        // 주의: keyId는 대소문자를 구분할 수 있으므로, 소문자로 변환하여 비교합니다.
        // ex) 'Shift' + 'j' -> keyId는 'J'가 될 수 있음
        const modifier = code.includes('Shift') ? 'shift' : 'ctrl';

        for (const pressedCode in this.pressedKeys) {
          const pressedData = this.pressedKeys[pressedCode];
          if (pressedData && pressedData.keyId) {
             // 실제 keyId가 모디파이어를 포함하거나 (capslock+k)
             // 또는 Shift가 떨어졌을 때 keyId가 대문자인 경우
             const keyIdLower = pressedData.keyId.toLowerCase();
             if (keyIdLower.startsWith(modifierPrefix) || (modifier === 'shift' && keyIdLower !== pressedData.keyId)) {
                if (this.activeInstrument) {
                  // activeInstrument에게 연주 멈춤을 명령합니다.
                  this.activeInstrument.handleRelease(pressedData.chord);
                }
                delete this.pressedKeys[pressedCode];
             }
          }
        }
      } else {
        const pressedData = this.pressedKeys[code];
        if (pressedData && this.activeInstrument) {
          // activeInstrument에게 연주 멈춤을 명령합니다.
          this.activeInstrument.handleRelease(pressedData.chord);
          delete this.pressedKeys[code];
        }
      }
    });
  }

  getKeyIdentifier(event) {
    const key = event.key;

    // 모디파이어 키 자체의 입력을 무시합니다. (예: Shift 키만 누르는 경우)
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock'].includes(key)) {
      return null;
    }

    // Ctrl 키 조합을 처리합니다.
    if (event.ctrlKey) {
      return `ctrl+${key.toLowerCase()}`;
    }

    // CapsLock 상태를 처리합니다. (Shift키와 함께 눌리지 않았을 때만)
    if (event.getModifierState && event.getModifierState('CapsLock') && !event.shiftKey) {
      return `capslock+${key.toLowerCase()}`;
    }

    // 그 외의 모든 경우 (일반 키, Shift 조합 키)는 event.key를 그대로 사용합니다.
    // Shift키 조합은 event.key가 'J' 또는 '(' 처럼 변환된 값을 가지므로,
    // 이 값을 그대로 키로 사용하는 것이 가장 간단하고 정확합니다.
    return key;
  }
  
  update(time, delta) {
    if (Tone.Transport.state !== 'started') return;
    
    const now = Tone.now();
    const travelTimeSeconds = this.previewTimeSec;

    this.scheduledNotes.forEach(note => {
      if (!note.visualObject || !note.visualObject.active) {
        return;
      }

      const timeToHit = note.hitTime - now;

      // 노트가 화면에 보여야 하는 시간 범위 내에 있는지 확인
      if (timeToHit >= -0.1 && timeToHit <= travelTimeSeconds) {
        // 오른쪽에서 왼쪽으로 이동하는 계산
        const progress = 1 - (timeToHit / travelTimeSeconds);
        const x = this.SPAWN_X - (this.SPAWN_X - this.HIT_LINE_X) * progress;
        note.visualObject.x = x;
      } else if (timeToHit < -0.1) {
        // 기준선을 지나간 노트는 제거
        note.visualObject.destroy();
        note.visualObject = null;
      }
    });

    this.scheduledNotes = this.scheduledNotes.filter(note => note.visualObject !== null);

    // 진행 막대 업데이트 (기존 코드 유지)
    if (this.progressBar) {
      const currentTransportTime = Tone.Transport.position;
      const [bar, beat, sixteenth] = currentTransportTime.split(':').map(Number);
      const barProgress = (beat * 16 + sixteenth) / (Tone.Transport.timeSignature * 16);
      
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ff00, 1);
      this.progressBar.fillRect(this.progressBarX, this.progressBarY, this.progressBarWidth * barProgress, this.progressBarHeight);
    }
  }
}