import Phaser from 'phaser';
import * as Tone from 'tone';
import Piano from '../instruments/Piano.js';
import ElectricGuitar from '../instruments/ElectricGuitar.js';
import NoteBlock from './NoteBlock.js';
import SongManager from './managers/SongManager.js';

// SongManager 인스턴스 생성
const songManager = new SongManager();


export default class JamScene extends Phaser.Scene {
  constructor() {
    super({ key: 'JamScene' });
    this.bpm = 84;
    this.socket = null;
    this.myInstrumentName = null; // 'keyboard', 'electric_guitar', 'bass', 'drums' 등
    this.activeInstrument = null; // 현재 활성화된 악기 컨트롤러 인스턴스
    this.pressedKeys = {};
    this.songManager = songManager; // SongManager 인스턴스
    this.noteBlocks = []; // NoteBlock 배열
    this.currentBar = 0; // 마디 추적
    this.barText = null;
    this.progressBar = null;
    this.progressBarBg = null;
    this.barDuration = 0;
    this.HIT_LINE_Y = 500;
    this.SPAWN_Y = 100;
    this.noteSpeed = 0;
    this.scheduledNotes = []; // NoteBlock 객체들을 저장
    this.keyPositions = {};
    this.isBarTransitioning = false; // 마디 트랜지션 중복 방지
    this.countdownStarted = false; // 카운트다운 시작 여부
    this.currentCombo = 0; // 현재 콤보 수
    this.totalScore = 0; // 총 점수
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
    
    // SongManager를 통해 곡 데이터 로드
    this.noteBlocks = this.songManager.getSongData(this.myInstrumentName);

    console.log(`JamScene: 나의 역할은 [${this.myInstrumentName}] 입니다.`);
    console.log(`NoteBlocks loaded: ${this.noteBlocks.length}`);
    console.log(`Current song: ${this.songManager.getCurrentSong()}`);

    this.setupTimingGuideUI(); // 먼저 UI 설정 (lane1Y, lane2Y 등 생성)
    
    // 레인 키 매핑 설정 (Y 좌표와 함께)
    const laneKeys = this.songManager.getLaneKeys(this.myInstrumentName);
    this.keyLanes = {
      [laneKeys[1]]: this.lane1Y,  // 1번 레인
      [laneKeys[2]]: this.lane2Y,  // 2번 레인
      [laneKeys[3]]: this.lane3Y,  // 3번 레인
      [laneKeys[4]]: this.lane4Y   // 4번 레인
    };
    
    console.log('Lane Keys:', laneKeys);
    console.log('Key Lanes:', this.keyLanes);

    this.createInstrument(); // 악기 컨트롤러 생성
    this.setupKeyboardInput();
    
    // 키보드 입력으로 AudioContext 시작
    this.input.keyboard.on('keydown', () => {
      this.initToneAudio();
    });
  }

  async initToneAudio() {
    if (Tone.context.state === 'suspended') {
      try {
        await Tone.start();
        console.log('Tone.js 오디오 컨텍스트 시작됨');
        
        // AudioContext가 시작되면 카운트다운 시작
        if (!this.countdownStarted) {
          this.countdownStarted = true;
          this.startCountdown();
        }
      } catch (error) {
        console.error('AudioContext 시작 실패:', error);
      }
    } else if (Tone.context.state === 'running' && !this.countdownStarted) {
      // 이미 실행 중이면 카운트다운만 시작
      this.countdownStarted = true;
      this.startCountdown();
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
    // 가로 방향 리듬게임으로 변경 - 회색 영역 전체를 활용
    this.RHYTHM_GAME_TOP = 80;    // 리듬게임 영역 상단
    this.RHYTHM_GAME_BOTTOM = 380; // 리듬게임 영역 하단
    this.HIT_LINE_X = 150;  // 기준선의 X 위치 (화면 왼쪽)
    this.SPAWN_X = this.cameras.main.width - 50; // 노트 생성 위치 (화면 오른쪽 여백)
    this.noteSpeed = 0;

    // 4개의 레인 Y 좌표 계산 (보조선 사이에 블럭이 위치하도록)
    const gameHeight = this.RHYTHM_GAME_BOTTOM - this.RHYTHM_GAME_TOP;
    const laneSpacing = gameHeight / 4; // 4등분하여 3개의 보조선과 4개의 레인 공간 생성
    
    // 보조선 위치 (블럭 사이의 경계)
    this.guideLine1Y = this.RHYTHM_GAME_TOP + laneSpacing * 1;
    this.guideLine2Y = this.RHYTHM_GAME_TOP + laneSpacing * 2;
    this.guideLine3Y = this.RHYTHM_GAME_TOP + laneSpacing * 3;
    
    // 블럭이 위치할 레인 (보조선 사이의 중앙)
    this.lane1Y = this.RHYTHM_GAME_TOP + laneSpacing * 0.5;
    this.lane2Y = this.RHYTHM_GAME_TOP + laneSpacing * 1.5;
    this.lane3Y = this.RHYTHM_GAME_TOP + laneSpacing * 2.5;
    this.lane4Y = this.RHYTHM_GAME_TOP + laneSpacing * 3.5;

    // 기준선 (수직선) 생성 - 리듬게임 영역 전체 높이로 확장
    this.add.line(0, 0, this.HIT_LINE_X, this.RHYTHM_GAME_TOP, this.HIT_LINE_X, this.RHYTHM_GAME_BOTTOM, 0xffffff, 3).setOrigin(0);

    this.noteVisualsGroup = this.add.group();

    // 레인별 키 매핑은 SongManager에서 가져온 것을 사용
    // this.keyLanes는 create() 메서드에서 설정됨

    // === 3개의 보조선(가로선) 추가 (블럭 사이의 경계) ===
    const guideLineYPositions = [this.guideLine1Y, this.guideLine2Y, this.guideLine3Y];
    guideLineYPositions.forEach(y => {
      this.add.line(
        0, 0,
        this.HIT_LINE_X, y, this.SPAWN_X, y,
        0xcccccc, 0.4 // 연한 회색, 적절한 투명도
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

    // NoteBlock들을 타이밍에 따라 스케줄링합니다.
    this.noteBlocks.forEach(noteBlock => {
      const hitTime = noteBlock.timing; // NoteBlock의 timing 속성 사용
      const spawnTime = hitTime - this.previewTimeSec;

      const nowAudio = Tone.now();
      const delaySec = spawnTime - nowAudio;

      const spawnNote = () => {
        // 디버깅: NoteBlock 정보 확인
        console.log(`Spawning note: key=${noteBlock.key}, lane=${noteBlock.lane}, yPos=${this.keyLanes[noteBlock.key]}`);
        
        const visualObject = this.spawnNoteVisual(noteBlock);
        noteBlock.visualObject = visualObject;
        noteBlock.expectedHitTime = hitTime;
        this.scheduledNotes.push(noteBlock);
      };

      if (delaySec <= 0) {
        spawnNote();
      } else {
        this.time.delayedCall(delaySec * 1000, spawnNote, [], this);
      }
    });

    Tone.Transport.start();
  }



  spawnNoteVisual(noteBlock) {
    const yPos = this.keyLanes[noteBlock.key] || this.cameras.main.height / 2;
    
    // 디버깅: 키와 Y 위치 확인
    if (!this.keyLanes[noteBlock.key]) {
      console.warn(`Key '${noteBlock.key}' not found in keyLanes:`, this.keyLanes);
    }

    // 노트 블록 생성 (세로 모양으로 변경하고 텍스트 제거)
    const visualBlock = this.add.rectangle(0, 0, 12, 60, 0x00ff00).setOrigin(0.5);

    // 컨테이너를 화면 오른쪽에서 시작하도록 설정 (텍스트 없이 블럭만)
    const container = this.add.container(this.SPAWN_X, yPos, [visualBlock]);
    this.noteVisualsGroup.add(container);
    return container;
  }

  startCountdown() {
    let count = 3;
    const countdownText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3, count, { 
      fontSize: '72px', // 기존 96px에서 72px로 줄임
      color: '#fff' 
    }).setOrigin(0.5);

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

      // NoteBlock에서 해당 키와 타이밍에 맞는 노트 찾기
      const now = Tone.now();
      const hitNoteBlock = this.findNoteBlockToHit(keyId, now);
      
      if (hitNoteBlock) {
        // 정확도 판정
        const accuracy = hitNoteBlock.judgeAccuracy(now);
        hitNoteBlock.hit(now, accuracy);
        
        // 악기 연주
        const notes = hitNoteBlock.note.split(',');
        this.activeInstrument.handleAttack(notes);
        this.pressedKeys[code] = { keyId, chord: notes, noteBlock: hitNoteBlock };
        
        // 콤보 및 점수 업데이트
        this.updateComboAndScore(accuracy);
        
        // 정확도를 화면에 표시
        this.showAccuracyText(accuracy, hitNoteBlock.lane);
        
        console.log(`NoteBlock hit: ${hitNoteBlock.toString()}, Accuracy: ${accuracy}, Score: ${hitNoteBlock.score}, Combo: ${this.currentCombo}, Total: ${this.totalScore}`);
      } else {
        console.warn(`No NoteBlock found for key '${keyId}' at this time.`);
      }
    });

    this.input.keyboard.on('keyup', (event) => {
      const code = event.code;

      // Shift 또는 Control 키에서 손을 떼면, 해당 조합으로 눌렀던 모든 소리를 멈춥니다.
      if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'ControlLeft' || code === 'ControlRight') {
        const modifierPrefix = code.includes('Shift') ? 'shift+' : 'ctrl+';
        const modifier = code.includes('Shift') ? 'shift' : 'ctrl';

        for (const pressedCode in this.pressedKeys) {
          const pressedData = this.pressedKeys[pressedCode];
          if (pressedData && pressedData.keyId) {
             const keyIdLower = pressedData.keyId.toLowerCase();
             if (keyIdLower.startsWith(modifierPrefix) || (modifier === 'shift' && keyIdLower !== pressedData.keyId)) {
                if (this.activeInstrument) {
                  this.activeInstrument.handleRelease(pressedData.chord);
                }
                delete this.pressedKeys[pressedCode];
             }
          }
        }
      } else {
        const pressedData = this.pressedKeys[code];
        if (pressedData && this.activeInstrument) {
          this.activeInstrument.handleRelease(pressedData.chord);
          delete this.pressedKeys[code];
        }
      }
    });
  }

  // NoteBlock에서 히트할 노트 찾기
  findNoteBlockToHit(keyId, currentTime) {
    const hitWindow = 0.2; // 히트 윈도우 (초)
    
    return this.scheduledNotes.find(noteBlock => {
      if (noteBlock.key !== keyId || noteBlock.isHit) return false;
      
      const timeDiff = Math.abs(currentTime - noteBlock.expectedHitTime);
      return timeDiff <= hitWindow;
    });
  }

  // 정확도를 화면에 표시하는 메서드
  showAccuracyText(accuracy, lane) {
    // 정확도별 색상 설정
    const accuracyColors = {
      'perfect': '#00ff00', // 초록색
      'good': '#ffff00',    // 노란색
      'bad': '#ff8800',     // 주황색
      'miss': '#ff0000'     // 빨간색
    };
    
    const color = accuracyColors[accuracy] || '#ffffff';
    
    // 레인별 Y 위치 계산
    const laneY = this.keyLanes[this.getLaneKey(lane)] || this.cameras.main.height / 2;
    
    // 정확도 텍스트 생성
    const accuracyText = this.add.text(this.HIT_LINE_X + 50, laneY - 30, accuracy.toUpperCase(), {
      fontSize: '24px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // 애니메이션 효과 (위로 올라가면서 페이드아웃)
    this.tweens.add({
      targets: accuracyText,
      y: accuracyText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        accuracyText.destroy();
      }
    });
  }

  // 레인 번호를 키로 변환하는 헬퍼 메서드
  getLaneKey(lane) {
    const laneKeys = {
      1: '3',
      2: 'e', 
      3: 'k',
      4: 'm'
    };
    return laneKeys[lane] || '3';
  }

  // 놓친 노트 처리 메서드
  handleMissedNote(noteBlock, currentTime) {
    if (noteBlock.isHit) return; // 이미 히트한 노트는 처리하지 않음
    
    // MISS 처리
    noteBlock.hit(currentTime, 'miss');
    
    // MISS 텍스트 표시
    this.showAccuracyText('miss', noteBlock.lane);
    
    // 콤보 리셋
    this.currentCombo = 0;
    console.log('콤보 리셋!');
    
    console.log(`NoteBlock missed: ${noteBlock.toString()}, Score: ${noteBlock.score}`);
  }

  // 콤보 및 점수 업데이트 메서드
  updateComboAndScore(accuracy) {
    // 정확도에 따른 콤보 증가
    if (accuracy === 'perfect' || accuracy === 'good') {
      this.currentCombo++;
    } else {
      this.currentCombo = 0; // bad나 miss면 콤보 리셋
    }
    
    // 점수 계산 (콤보 보너스 포함)
    let score = 0;
    switch (accuracy) {
      case 'perfect':
        score = 100 + (this.currentCombo * 10); // 콤보 보너스
        break;
      case 'good':
        score = 50 + (this.currentCombo * 5);
        break;
      case 'bad':
        score = 10;
        break;
      case 'miss':
        score = 0;
        break;
    }
    
    this.totalScore += score;
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

    this.scheduledNotes.forEach(noteBlock => {
      if (!noteBlock.visualObject || !noteBlock.visualObject.active) {
        return;
      }

      const timeToHit = noteBlock.expectedHitTime - now;

      // 노트가 화면에 보여야 하는 시간 범위 내에 있는지 확인
      if (timeToHit >= -0.1 && timeToHit <= travelTimeSeconds) {
        // 오른쪽에서 왼쪽으로 이동하는 계산
        const progress = 1 - (timeToHit / travelTimeSeconds);
        const x = this.SPAWN_X - (this.SPAWN_X - this.HIT_LINE_X) * progress;
        noteBlock.visualObject.x = x;
        
        // 히트 라인을 지나간 노트는 MISS 처리
        if (timeToHit < -0.1 && !noteBlock.isHit) {
          this.handleMissedNote(noteBlock, now);
        }
      } else if (timeToHit < -0.1) {
        // 기준선을 지나간 노트는 제거
        if (!noteBlock.isHit) {
          this.handleMissedNote(noteBlock, now);
        }
        noteBlock.visualObject.destroy();
        noteBlock.visualObject = null;
      }
    });

    this.scheduledNotes = this.scheduledNotes.filter(noteBlock => noteBlock.visualObject !== null);

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