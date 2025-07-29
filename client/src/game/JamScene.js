import Phaser from 'phaser';
import * as Tone from 'tone';
import Piano from '../instruments/Piano.js';
import ElectricGuitar from '../instruments/ElectricGuitar.js';
import Drum from '../instruments/Drum.js';
import NoteBlock from './NoteBlock.js';
import SongManager from './managers/SongManager.js';

import socket from '../services/socket.js';
// SongManager 인스턴스 생성
const songManager = new SongManager();


export default class JamScene extends Phaser.Scene {
  constructor() {
    super({ key: 'JamScene' });
    this.bpm = 100;
    this.socket = null;
    this.myInstrumentName = null;
    this.activeInstrument = null;
    this.pressedKeys = {};
    this.songManager = songManager;
    this.noteBlocks = [];
    this.currentBar = 0;
    this.barText = null;
    this.barDuration = 0;
    this.HIT_LINE_X = 150; // 기준선의 X 위치 (화면 왼쪽) - constructor에서 초기화
    this.SPAWN_X = 0; // create에서 계산될 예정 (화면 너비 - 50)
    this.noteSpeed = 0;
    this.previewTimeSec = 2; // ▶ 블록이 화면을 가로질러 이동하는 전체 시간 (초) - constructor에서 초기화

    this.scheduledNotes = [];
    this.keyPositions = {};
    this.isBarTransitioning = false;
    this.countdownStarted = false;
    this.audioInitialized = false;
    this.countdownTimer = null;
    this.currentCombo = 0;
    this.totalScore = 0;
    
    // 정확도 관련 변수들
    this.totalHits = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.badHits = 0;
    this.missHits = 0;
    this.currentAccuracy = 100; // 시작 정확도 100%
    
    if (!window.jamSceneCountdownStarted) {
      window.jamSceneCountdownStarted = false;
    }
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
    // Deemo 스타일: 밝은 흰색 계열 배경
    this.cameras.main.setBackgroundColor('#f7f6f3'); // Deemo 느낌의 따뜻한 흰색
    this.myInstrumentName = this.game.registry.get('myInstrument');
    
    // SPAWN_X는 카메라 너비에 의존하므로 create에서 계산
    this.SPAWN_X = this.cameras.main.width - 50; 
    
    // SongManager를 통해 곡 데이터 로드
    this.noteBlocks = this.songManager.getSongData(this.myInstrumentName);
    console.log(`JamScene: 나의 역할은 [${this.myInstrumentName}] 입니다.`);
    console.log(`NoteBlocks loaded: ${this.noteBlocks.length}`);
    console.log(`Current song: ${this.songManager.getCurrentSong()}`);
    
    // noteSpeed 계산은 previewTimeSec과 SPAWN_X에 의존하므로 create 또는 startSongTracker에서
    const travelDistance = this.SPAWN_X - this.HIT_LINE_X;
    this.noteSpeed = travelDistance / this.previewTimeSec; // ▶ noteSpeed 계산

    this.setupTimingGuideUI();
    
    const laneKeys = this.songManager.getLaneKeys(this.myInstrumentName);
    this.keyLanes = {
      [laneKeys[1]]: this.lane1Y,
      [laneKeys[2]]: this.lane2Y,
      [laneKeys[3]]: this.lane3Y,
      [laneKeys[4]]: this.lane4Y
    };
    
    console.log('Lane Keys:', laneKeys);
    console.log('Key Lanes:', this.keyLanes);
    this.createInstrument();
    this.setupKeyboardInput();
  }

  async initToneAudio() {
    console.log(`initToneAudio 호출됨 - context state: ${Tone.context.state}`);
    
    // 이미 AudioContext가 실행 중이면 아무것도 하지 않음
    if (Tone.context.state === 'running') {
      console.log('AudioContext 이미 실행 중 - 무시');
      return;
    }
    
    if (Tone.context.state === 'suspended') {
      try {
        await Tone.start();
        console.log('Tone.js 오디오 컨텍스트 시작됨');
        
        // AudioContext가 시작되면 카운트다운 시작 (한 번만)
        if (!this.countdownStarted) {
          console.log('카운트다운 시작 (suspended -> running)');
          this.countdownStarted = true;
          this.startCountdown();
        }
      } catch (error) {
        console.error('AudioContext 시작 실패:', error);
      }
    } else {
      console.log(`AudioContext 시작하지 않음 - context state: ${Tone.context.state}`);
    }
  }

  createInstrument() {
    switch (this.myInstrumentName) {
      case 'keyboard':
        this.activeInstrument = new Piano(this);
        break;
      case 'guitar':
        this.activeInstrument = new ElectricGuitar(this);
        break;
      case 'drum':
        this.activeInstrument = new Drum(this);
        break;
      case 'vocal':
        // 보컬 악기 생성 (임시로 Piano 사용)
        this.activeInstrument = new Piano(this);
        break;
      default:
        console.warn(`알 수 없는 악기: ${this.myInstrumentName}, 기본값으로 Piano 사용`);
        this.activeInstrument = new Piano(this);
        break;
    }
    
    // 악기 UI 생성 및 샘플 로드를 시작합니다.
    this.activeInstrument.createUI();
  }

  setupTimingGuideUI() {
    // Deemo 스타일: 밝은 배경에 어울리는 연한 회색/베이지 계열로 UI 색상 조정
    this.RHYTHM_GAME_TOP = 0;
    this.RHYTHM_GAME_BOTTOM = this.cameras.main.height;
    this.HIT_LINE_X = 150;
    this.SPAWN_X = this.cameras.main.width - 50;
    this.noteSpeed = 0;

    const gameHeight = this.RHYTHM_GAME_BOTTOM - this.RHYTHM_GAME_TOP;
    const laneSpacing = gameHeight / 4;
    
    this.guideLine1Y = this.RHYTHM_GAME_TOP + laneSpacing * 1;
    this.guideLine2Y = this.RHYTHM_GAME_TOP + laneSpacing * 2;
    this.guideLine3Y = this.RHYTHM_GAME_TOP + laneSpacing * 3;
    
    this.lane1Y = this.RHYTHM_GAME_TOP + laneSpacing * 0.5;
    this.lane2Y = this.RHYTHM_GAME_TOP + laneSpacing * 1.5;
    this.lane3Y = this.RHYTHM_GAME_TOP + laneSpacing * 2.5;
    this.lane4Y = this.RHYTHM_GAME_TOP + laneSpacing * 3.5;

    // 기준선 (수직선) - 진한 베이지/브라운 계열
    this.add.line(0, 0, this.HIT_LINE_X, this.RHYTHM_GAME_TOP, this.HIT_LINE_X, this.RHYTHM_GAME_BOTTOM, 0x8d7964, 3).setOrigin(0);

    // 기준선 왼쪽 영역을 덮는 배경 블럭 - 연한 베이지
    const leftBackgroundBlock = this.add.rectangle(
      this.HIT_LINE_X / 2,
      this.cameras.main.height / 2,
      this.HIT_LINE_X,
      this.cameras.main.height,
      0xf3ede7 // Deemo 느낌의 연한 베이지
    ).setOrigin(0.5);
    leftBackgroundBlock.setDepth(1000);

    this.noteVisualsGroup = this.add.group();

    // 3개의 보조선(가로선) - 연한 회색
    const guideLineYPositions = [this.guideLine1Y, this.guideLine2Y, this.guideLine3Y];
    guideLineYPositions.forEach(y => {
      this.add.line(
        0, 0,
        this.HIT_LINE_X, y, this.SPAWN_X, y,
        0xd6d3ce, 0.5 // 연한 회색, 적당한 투명도
      ).setOrigin(0);
    });

    // 키 입력 표시 등 나머지 로직은 그대로
    this.keyPressIndicators = {};
    const laneKeys = this.songManager.getLaneKeys(this.myInstrumentName);
    
    // 각 레인별로 원형 키 입력 표시 생성
    for (let lane = 1; lane <= 4; lane++) {
      const key = laneKeys[lane];
      const laneY = this[`lane${lane}Y`];
      
             const indicatorGraphics = this.add.graphics();
       indicatorGraphics.fillStyle(0xffffff, 0.8); // 흰색, 80% 투명도
       indicatorGraphics.fillCircle(this.HIT_LINE_X, laneY, 25); // 기준선(HIT_LINE_X)에 원 생성
       
       indicatorGraphics.setVisible(false); // 초기에는 숨김
       indicatorGraphics.setDepth(2000); // 기준선 왼쪽 블럭(1000)보다 높은 우선순위
      
      this.keyPressIndicators[key] = {
        graphics: indicatorGraphics, // 이제 Graphics 객체 자체가 원입니다.
        lane: lane,
        isPressed: false // 눌림 상태 추적
      };
    }
  }

  startSongTracker() {
    // 이전에 예약된 이벤트가 있다면 모두 제거하여 중복 실행을 방지합니다.
    Tone.Transport.clear();
    Tone.Transport.stop();
    Tone.Transport.cancel(0);

    this.currentBar = 0;

    const bpm = 84;
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.timeSignature = 4;
    this.barDuration = Tone.Time('1m').toSeconds();

    // 노트가 화면을 가로질러 이동하는 시간을 설정합니다.
    this.previewTimeSec = 2; // 3초 동안 오른쪽에서 왼쪽으로 이동
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
    
    if (!this.keyLanes[noteBlock.key]) {
      console.warn(`Key '${noteBlock.key}' not found in keyLanes:`, this.keyLanes);
    }

    const gameHeight = this.RHYTHM_GAME_BOTTOM - this.RHYTHM_GAME_TOP;
    const laneSpacing = gameHeight / 4;
    const baseHeight = laneSpacing; 
    
    let visualBlock;
    let blockWidth = 0; 
    
    // 블록 간 시각적 간격을 위한 마진 값 (픽셀 단위)
    const spacingMargin = 10; // 예를 들어 2픽셀씩 줄입니다. 필요에 따라 조절하세요.
    
    if (noteBlock.blockType === 'tap') {
      blockWidth = 40; 
      visualBlock = this.add.rectangle(0, 0, blockWidth, baseHeight, 0x00cc00).setOrigin(0, 0.5); 
      
    } else if (noteBlock.blockType === 'hold') {
      // 홀드 블럭: duration에 비례하여 너비 계산
      blockWidth = this.noteSpeed * noteBlock.duration; 
      const minWidth = 40; 
      blockWidth = Math.max(minWidth, blockWidth); 
      
      // ▶ 핵심 수정: 계산된 너비에서 마진만큼 빼줍니다.
      blockWidth = Math.max(minWidth, blockWidth - spacingMargin); // 최소 너비도 고려하여 음수가 되지 않도록

      // Graphics 객체를 생성하고 그 안에 블록을 그립니다.
      const holdGraphics = this.add.graphics();
      
      // 메인 블럭 (진한 파란색)
      holdGraphics.fillStyle(0x0088ff, 1);
      holdGraphics.fillRect(0, -baseHeight / 2, blockWidth, baseHeight); 
      
      // 홀드 블럭의 끝 부분 (밝은 파란색)
      holdGraphics.fillStyle(0x00aaff, 1);
      holdGraphics.fillRect(blockWidth - 10, -baseHeight / 2, 10, baseHeight);
      
      // 홀드 블럭의 시작 부분 (더 밝은 파란색)
      holdGraphics.fillStyle(0x00ccff, 1);
      holdGraphics.fillRect(0, -baseHeight / 2, 10, baseHeight);
      
      // 가운데 연결선 (사각형 안에 가로선)
      holdGraphics.lineStyle(2, 0xffffff, 0.8); // 흰색 선, 약간 투명
      holdGraphics.beginPath();
      holdGraphics.moveTo(0, 0); // 사각형 왼쪽 중앙
      holdGraphics.lineTo(blockWidth, 0); // 사각형 오른쪽 중앙
      holdGraphics.strokePath();
      
      // 연결선 위에 작은 점들 (홀드 블럭임을 표시)
      const dotCount = Math.floor(blockWidth / 20); // 20px마다 점 하나
      for (let i = 1; i < dotCount; i++) {
        const x = (blockWidth / dotCount) * i;
        holdGraphics.fillStyle(0xffffff, 0.9);
        holdGraphics.fillCircle(x, 0, 2);
      }
      
      visualBlock = holdGraphics;
    }
    
    noteBlock.blockWidth = blockWidth;

    const container = this.add.container(this.SPAWN_X, yPos, [visualBlock]);
    this.noteVisualsGroup.add(container);
    
    return container;
  }

  startCountdown() {
    console.log('startCountdown 호출됨');
    
    // 이미 카운트다운이 실행 중인지 확인
    if (this.countdownTimer) {
      console.log('카운트다운 이미 실행 중 - 무시');
      return;
    }
    
    let count = 3;
    const countdownText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3, count, { 
      fontSize: '72px', // 기존 96px에서 72px로 줄임
      color: '#fff' 
    }).setOrigin(0.5);

    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        count--;
        console.log(`카운트다운: ${count}`);
        if (count > 0) {
          countdownText.setText(count);
        } else {
          console.log('카운트다운 완료, startSongTracker 시작');
          countdownText.destroy();
          this.countdownTimer.remove();
          this.countdownTimer = null;
          this.startSongTracker();
        }
      },
      callbackScope: this,
      repeat: 2
    });
  }

  setupKeyboardInput() {
    this.input.keyboard.on('keydown', (event) => {
      event.preventDefault();

      const code = event.code;
      
      // ▶ 수정: event.repeat 일 때만 바로 리턴하여 중복 키다운 이벤트 방지
      if (event.repeat) {
        // console.log(`Key repeat ignored: ${event.key}`); // 디버깅용
        return; 
      }

      // AudioContext 시작 (첫 번째 키 입력 시에만)
      if (!this.audioInitialized) {
        this.audioInitialized = true;
        this.initToneAudio();
      }

      // 키가 이미 눌려있지만, repeat이 아닌 경우 (예: 동시에 두 키를 눌렀을 때, 
      // 한 키가 먼저 인식되어 pressedKeys에 등록된 후 다른 키가 인식되는 경우)
      // 이는 정상적인 동시 입력 상황이므로, 여기서는 무시하지 않습니다.
      // this.pressedKeys[code]를 통해 '눌려있음' 상태를 관리하되,
      // 노트 블록 히트 로직은 이미 히트된 블록은 다시 찾지 않도록 되어있습니다.
      // 따라서 이 부분은 제거합니다: if (this.pressedKeys[code]) return;

      const keyId = this.getKeyIdentifier(event);
      if (!keyId) return;

      // 키 입력 표시 활성화
      this.showKeyPressIndicator(keyId, true);

      // NoteBlock에서 해당 키와 타이밍에 맞는 노트 찾기
      const now = Tone.now();
      const hitNoteBlock = this.findNoteBlockToHit(keyId, now);
      
      if (hitNoteBlock) {
        // ▶ 추가: 현재 눌린 키(code)에 NoteBlock 인스턴스를 저장하여,
        //   keyup 시 해당 NoteBlock의 상태를 업데이트할 수 있도록 합니다.
        this.pressedKeys[code] = { keyId, noteBlock: hitNoteBlock, chord: hitNoteBlock.note.split(',') };

        if (hitNoteBlock.blockType === 'tap') {
          const accuracy = hitNoteBlock.judgeAccuracy(now);
          hitNoteBlock.hit(now, accuracy);
          this.activeInstrument.handleAttack(hitNoteBlock.note.split(','), keyId);
          // this.pressedKeys[code]는 이미 위에서 설정됨
          this.updateComboAndScore(hitNoteBlock.accuracy);
          this.showAccuracyText(hitNoteBlock.accuracy, hitNoteBlock.lane);
          console.log(`Tap Block HIT: ${hitNoteBlock.toString()}, Acc: ${hitNoteBlock.accuracy}`);
          
        } else if (hitNoteBlock.blockType === 'hold') {
          hitNoteBlock.startHold(now);
          // 시작 판정 텍스트 표시 (한 번만)
          if (!hitNoteBlock.startAccuracyShown) {
            this.showAccuracyText(hitNoteBlock.startAccuracy, hitNoteBlock.lane);
            hitNoteBlock.startAccuracyShown = true;
          }
          this.activeInstrument.handleAttack(hitNoteBlock.note.split(','), keyId);
          // this.pressedKeys[code]는 이미 위에서 설정됨
          console.log(`Hold Block STARTED: ${hitNoteBlock.toString()}, Start Acc: ${hitNoteBlock.startAccuracy}`);
        }
      } else {
        // 히트할 노트 블록이 없는 경우, 즉시 음을 재생하고 release 처리를 위한 dummy data를 pressedKeys에 저장
        // 이는 플레이어가 박자를 틀렸지만, 그래도 소리는 나게 하고 싶을 때 유용합니다.
        // 하지만 리듬 게임에서 '틀린 음'에 대한 시각적 피드백이나 점수 처리가 없다면 혼란을 줄 수 있습니다.
        // 현재는 warn 메시지만 출력합니다.
        console.warn(`No NoteBlock found for key '${keyId}' at this time. (This keyPress was not mapped to an active note block)`);
        
        // **옵션:** 틀린 음도 소리 나게 하고 싶을 경우 (점수/판정 없음)
        // const dummyChord = ['C4']; // 또는 해당 keyId에 대한 기본 음정
        // this.activeInstrument.handleAttack(dummyChord, keyId);
        // this.pressedKeys[code] = { keyId, chord: dummyChord, noteBlock: null }; // noteBlock을 null로 표시
      }
    });

    this.input.keyboard.on('keyup', (event) => {
      const code = event.code;
      const keyId = this.getKeyIdentifier(event); // keyup 이벤트에서도 keyId를 가져와야 함.
      if (!keyId) return; // 모디파이어 키 자체는 처리 안함

      // 키 입력 표시 비활성화
      this.showKeyPressIndicator(keyId, false);

      const pressedData = this.pressedKeys[code]; // 이전에 눌렸던 키 데이터 가져오기
      
      // 키를 떼는 순서대로 로그 출력 (pressedData가 없어도)
      console.log(`Key released: ${keyId} (Code: ${code})`);
      
      if (pressedData && this.activeInstrument) {
        const now = Tone.now();
        
        if (pressedData.noteBlock) { // NoteBlock과 연결된 키업이라면
          if (pressedData.noteBlock.blockType === 'hold') {
            pressedData.noteBlock.endHold(now); // NoteBlock 내부에서 최종 정확도 결정
            this.updateComboAndScore(pressedData.noteBlock.accuracy);
            this.showAccuracyText(pressedData.noteBlock.accuracy, pressedData.noteBlock.lane);
            console.log(`Hold Block ENDED (on KeyUp): ${pressedData.noteBlock.toString()}, Acc: ${pressedData.noteBlock.accuracy}, Final Score: ${pressedData.noteBlock.score}`);

          } else if (pressedData.noteBlock.blockType === 'tap') {
            pressedData.noteBlock.endTapHold(now); // NoteBlock 내부에서 홀드 오버 및 정확도 결정
            if (pressedData.noteBlock.isTapHoldOver) {
              this.updateComboAndScore(pressedData.noteBlock.accuracy);
              this.showAccuracyText(pressedData.noteBlock.accuracy, pressedData.noteBlock.lane);
              console.log(`Tap Block HOLD OVER (on KeyUp): ${pressedData.noteBlock.toString()}, Acc: ${pressedData.noteBlock.accuracy}, Score: ${pressedData.noteBlock.score}`);
            }
          }
        } else { // NoteBlock과 연결되지 않은 (dummy) 키업이라면
            // 옵션: dummyChord를 사용한 경우, 여기서 해당 소리 멈춤
            // console.log(`Releasing dummy chord for key: ${pressedData.keyId}`);
        }
        
        this.activeInstrument.handleRelease(pressedData.chord);
        delete this.pressedKeys[code]; // 눌린 키 상태 해제
      }
    });
  }

  // NoteBlock에서 히트할 노트 찾기
  findNoteBlockToHit(keyId, currentTime) {
    return this.scheduledNotes.find(noteBlock => {
      if (noteBlock.key !== keyId) return false;
      
      // 완료된 Hold 블럭은 제외 (한 번 완료되면 다시 누를 수 없음)
      if (noteBlock.blockType === 'hold' && noteBlock.isCompleted) return false;
      
      // 이미 히트한 노트는 제외 (단, 홀드 블럭은 이미 홀드 중이어도 계속 처리 가능)
      if (noteBlock.isHit && noteBlock.blockType !== 'hold') return false;
      
      // 홀드 블럭이 이미 홀드 중이라면 제외 (중복 홀드 방지)
      if (noteBlock.blockType === 'hold' && noteBlock.isHolding) return false;
      
      // 블럭 타입에 따른 히트 윈도우 설정
      let hitWindow;
      if (noteBlock.blockType === 'hold') {
        // 홀드 블럭: 더 넓은 히트 윈도우 (홀드 지속 시간만큼)
        hitWindow = noteBlock.duration + 0.2; // 홀드 지속 시간 + 0.2초 여유
      } else {
        // 탭 블럭: 기본 히트 윈도우
        hitWindow = 0.2;
      }
      
      const timeDiff = Math.abs(currentTime - noteBlock.expectedHitTime);
      return timeDiff <= hitWindow;
    });
  }

  // 정확도를 화면에 표시하는 메서드
  showAccuracyText(accuracy, lane) {
    console.log(`showAccuracyText called: accuracy=${accuracy}, lane=${lane}`);
    
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
    
    console.log(`showAccuracyText - HIT_LINE_X: ${this.HIT_LINE_X}, laneY: ${laneY}, color: ${color}`);
    
    // 정확도 텍스트 생성
    const accuracyText = this.add.text(this.HIT_LINE_X + 50, laneY - 30, accuracy.toUpperCase(), {
      fontSize: '24px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    console.log(`showAccuracyText - text created at x: ${this.HIT_LINE_X + 50}, y: ${laneY - 30}`);
    
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

  // 키 입력 표시를 제어하는 메서드
  showKeyPressIndicator(keyId, isPressed) {
    const indicator = this.keyPressIndicators[keyId];
    if (!indicator) return;

    indicator.isPressed = isPressed;
    
    if (isPressed) {
      // 키를 누를 때: 원을 보이게 하고 주기적 퍼지는 효과 시작
      indicator.graphics.setVisible(true);
      this.startRippleEffect(keyId);
    } else {
      // 키를 뗄 때: 원을 숨기고 퍼지는 효과 중지
      indicator.graphics.setVisible(false);
      this.stopRippleEffect(keyId);
    }
  }

  // 주기적 깜빡이는 효과 시작
  startRippleEffect(keyId) {
    const indicator = this.keyPressIndicators[keyId];
    if (!indicator || indicator.rippleTimer) return; // 이미 실행 중이면 무시

    // 부드럽게 깜빡이는 애니메이션 시작
    this.tweens.add({
      targets: indicator.graphics,
      alpha: 0.3,
      duration: 400,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  // 주기적 깜빡이는 효과 중지
  stopRippleEffect(keyId) {
    const indicator = this.keyPressIndicators[keyId];
    if (!indicator) return;

    // 깜빡이는 애니메이션 중지
    this.tweens.killTweensOf(indicator.graphics);
    indicator.graphics.setAlpha(0.8); // 원래 투명도로 복원
  }

  // 물방울이 터지는 효과를 생성하는 메서드
  createSplashEffect(lane) {
    const laneY = this[`lane${lane}Y`];
    const splashX = this.HIT_LINE_X;
    const splashY = laneY;
    
    // 물방울 효과를 위한 컨테이너 생성 (고정된 위치)
    const splashContainer = this.add.container(splashX, splashY);
    
    // 높은 우선순위 설정 (기준선 왼쪽 배경 블럭보다 위에 표시)
    splashContainer.setDepth(2000);
    
    // 중앙 원형 효과
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0xffffff, 0.8);
    centerCircle.fillCircle(0, 0, 25);
    splashContainer.add(centerCircle);
    
    // 중앙 원형 애니메이션: 크기 확대 및 투명도 감소
    this.tweens.add({
      targets: centerCircle,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 400,
      ease: 'Power2'
    });
    
    // 전체 컨테이너 제거
    this.time.delayedCall(450, () => {
      splashContainer.destroy();
    });
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
    
    // 정확도 업데이트
    this.updateAccuracy(accuracy);
  }

  // 정확도 업데이트 메서드
  updateAccuracy(accuracy) {
    this.totalHits++;
    
    switch (accuracy) {
      case 'perfect':
        this.perfectHits++;
        break;
      case 'good':
        this.goodHits++;
        break;
      case 'bad':
        this.badHits++;
        break;
      case 'miss':
        this.missHits++;
        break;
    }
    
    // 정확도 계산: (perfect + good) / total * 100
    const successfulHits = this.perfectHits + this.goodHits;
    this.currentAccuracy = this.totalHits > 0 ? (successfulHits / this.totalHits) * 100 : 100;
    
    // React 컴포넌트에 정확도 업데이트 이벤트 발생
    this.game.events.emit('accuracyUpdate', this.currentAccuracy);
    
    console.log(`Accuracy updated: ${this.currentAccuracy.toFixed(1)}% (Perfect: ${this.perfectHits}, Good: ${this.goodHits}, Bad: ${this.badHits}, Miss: ${this.missHits}, Total: ${this.totalHits})`);
  }

  getKeyIdentifier(event) {
    const key = event.key;

    // 모디파이어 키 자체의 입력을 무시합니다.
    if (['Alt', 'Meta', 'CapsLock'].includes(key)) {
      return null;
    }

    // CapsLock 상태를 처리합니다.
    if (event.getModifierState && event.getModifierState('CapsLock')) {
      return `capslock+${key.toLowerCase()}`;
    }

    // 일반 키는 event.key를 그대로 사용합니다.
    return key.toLowerCase();
  }
  
  update(time, delta) {
    if (Tone.Transport.state !== 'started') return;
    
    const now = Tone.now(); // AudioContext 시간
    // travelTimeSeconds (previewTimeSec)는 constructor 또는 create에서 설정됨.
    // this.noteSpeed도 constructor 또는 create에서 설정됨.
    
    // 현재 누르고 있는 키들에 대해 노트 찾기 시도
    Object.keys(this.pressedKeys).forEach(code => {
      const pressedData = this.pressedKeys[code];
      if (pressedData && !pressedData.noteBlock) {
        // 노트가 할당되지 않은 키에 대해 노트 찾기 시도
        const hitNoteBlock = this.findNoteBlockToHit(pressedData.keyId, now);
        if (hitNoteBlock) {
          // 노트를 찾았으면 할당
          pressedData.noteBlock = hitNoteBlock;
          console.log(`Note found for held key '${pressedData.keyId}': ${hitNoteBlock.toString()}`);
        }
      }
    });
    
    this.scheduledNotes.forEach(noteBlock => {
      if (!noteBlock.visualObject || !noteBlock.visualObject.active) {
        return;
      }

      // 홀드 블럭 진행률 업데이트 및 시각적 피드백 (홀드 중이거나 홀드가 끝나지 않은 경우)
      if (noteBlock.blockType === 'hold' && (noteBlock.isHolding || noteBlock.holdStartTime)) {
        noteBlock.updateHoldProgress(now);
        
        if (noteBlock.visualObject && noteBlock.visualObject.list) {
          const graphics = noteBlock.visualObject.list[0]; // Graphics 객체
          if (graphics) {
            const holdTime = now - noteBlock.holdStartTime;
            const isTooShort = holdTime < noteBlock.minHoldTime;
            
            // 이전 그래픽을 지우고 새로운 디자인으로 다시 그리기
            graphics.clear();
            
            // spawnNoteVisual과 동일한 baseHeight 계산 사용
            const gameHeight = this.RHYTHM_GAME_BOTTOM - this.RHYTHM_GAME_TOP;
            const laneSpacing = gameHeight / 4;
            const baseHeight = laneSpacing;
            
            // 홀드 블럭이 기준선에 닿고 있는지 확인 (홀드 진행 중에는 계속 주황색 유지)
            const timeToHitStart = noteBlock.expectedHitTime - now;
            const timeToEndHit = timeToHitStart - (noteBlock.blockWidth / this.noteSpeed);
            const isAtHitLine = Math.abs(timeToHitStart) <= 0.1; // 기준선 근처 (0.1초 이내)
            const isEndAtHitLine = Math.abs(timeToEndHit) <= 0.1; // 끝점이 기준선 근처 (0.1초 이내)
            const isHoldInProgress = noteBlock.isHolding && noteBlock.holdStartTime; // 홀드 진행 중인지 확인
            
            // 홀드 블럭이 기준선을 지나갔는지 확인 (늦게 눌렀을 때도 주황색으로 바뀌도록)
            const isPastHitLine = timeToHitStart < 0; // 기준선을 지나갔는지 확인
            const isWithinHoldWindow = timeToHitStart > -noteBlock.duration; // 홀드 윈도우 내에 있는지 확인
            
            // 색상 결정: 홀드 진행 중이면서 시작이 miss가 아닐 때만 주황색, 그 외에는 파란색
            let mainColor, startColor, endColor, lineColor;
            if (isHoldInProgress && noteBlock.startAccuracy !== 'miss') {
              mainColor = 0xff8800; // 주황색 (홀드 중)
              startColor = 0xff8800;
              endColor = 0xff8800;
              lineColor = 0xffffff; // 흰색 선
            } else {
              mainColor = 0x0088ff; // 기본 파란색
              startColor = 0x00ccff; // 밝은 파란색
              endColor = 0x00aaff; // 중간 파란색
              lineColor = 0xffffff; // 흰색 선
            }
            
            // 메인 블럭
            graphics.fillStyle(mainColor, 1);
            graphics.fillRect(0, -baseHeight / 2, noteBlock.blockWidth, baseHeight);
            
            // 홀드 블럭의 끝 부분
            graphics.fillStyle(endColor, 1);
            graphics.fillRect(noteBlock.blockWidth - 10, -baseHeight / 2, 10, baseHeight);
            
            // 홀드 블럭의 시작 부분
            graphics.fillStyle(startColor, 1);
            graphics.fillRect(0, -baseHeight / 2, 10, baseHeight);
            
            // 가운데 연결선 (사각형 안에 가로선)
            graphics.lineStyle(2, lineColor, 0.8);
            graphics.beginPath();
            graphics.moveTo(0, 0);
            graphics.lineTo(noteBlock.blockWidth, 0);
            graphics.strokePath();
            
            // 연결선 위에 작은 점들
            const dotCount = Math.floor(noteBlock.blockWidth / 20);
            for (let i = 1; i < dotCount; i++) {
              const x = (noteBlock.blockWidth / dotCount) * i;
              graphics.fillStyle(lineColor, 0.9);
              graphics.fillCircle(x, 0, 2);
            }
          }
        }
      }
      // 탭 블럭 홀드 오버 실시간 체크 및 시각적 피드백 (기존과 동일)
      if (noteBlock.blockType === 'tap' && noteBlock.isHit && !noteBlock.isTapHoldOver) {
        const holdOverOccurred = noteBlock.checkTapHoldOver(now);
        if (holdOverOccurred) {
          this.updateComboAndScore(noteBlock.accuracy);
          this.showAccuracyText(noteBlock.accuracy, noteBlock.lane);
          if (noteBlock.visualObject && noteBlock.visualObject.setFillStyle) { // Graphics 객체에 직접 setFillStyle 사용
            noteBlock.visualObject.setFillStyle(0xff0000); 
          }
        }
      }
      // 탭 블럭 홀드 오버 경고 (0.2초 이상 누르면 노란색으로 경고)
      if (noteBlock.blockType === 'tap' && noteBlock.isHit && !noteBlock.isTapHoldOver && noteBlock.tapHoldStartTime) {
        const holdTime = now - noteBlock.tapHoldStartTime;
        if (holdTime > 0.2 && holdTime <= noteBlock.maxTapHoldTime) {
          if (noteBlock.visualObject && noteBlock.visualObject.setFillStyle) { // Graphics 객체에 직접 setFillStyle 사용
            noteBlock.visualObject.setFillStyle(0xffff00); 
          }
        }
      }

      // 노트의 시작점이 기준선에 도달하는 시간을 기준으로 현재 진행도를 계산합니다.
      // noteBlock.expectedHitTime은 노트의 '왼쪽 끝'이 HIT_LINE_X에 닿는 시간입니다.
      const timeToHitStart = noteBlock.expectedHitTime - now; 
      
      // 홀드 블럭의 끝지점이 기준선에 닿을 때 끝 판정 표시
      if (noteBlock.blockType === 'hold' && noteBlock.isHit && !noteBlock.endAccuracyShown) {
        // 끝지점이 기준선에 도달하는 시간 계산
        const timeToEndHit = timeToHitStart - (noteBlock.blockWidth / this.noteSpeed);
        
        // 디버깅: 각 홀드 블럭의 상태 확인
        console.log(`Debug - Hold end check for lane ${noteBlock.lane}: timeToEndHit=${timeToEndHit.toFixed(2)}, endAccuracy=${noteBlock.endAccuracy}, endAccuracyShown=${noteBlock.endAccuracyShown}, key=${noteBlock.key}`);
        
        // 조건을 완화: 끝지점이 기준선을 지나갔거나, endAccuracy가 설정되었을 때 끝 판정 표시
        if ((timeToEndHit < 0 || noteBlock.endAccuracy) && noteBlock.endAccuracy) {
          this.showAccuracyText(noteBlock.endAccuracy, noteBlock.lane);
          noteBlock.endAccuracyShown = true;
          console.log(`Hold Block end accuracy displayed: ${noteBlock.endAccuracy} for lane ${noteBlock.lane} (${now.toFixed(2)}s)`);
        }
      }
      
      // 노트가 화면 전체를 이동하는 시간 (SPAWN_X에서 HIT_LINE_X까지)
      const totalTravelTime = this.previewTimeSec; 

      // 현재 진행도 (0 ~ 1.0)
      const progress = 1 - (timeToHitStart / totalTravelTime); 
      
      // 노트의 X 위치 계산: SPAWN_X에서 HIT_LINE_X까지 이동
      // noteBlock.visualObject는 컨테이너입니다. setX() 사용.
      const x = this.SPAWN_X - (this.SPAWN_X - this.HIT_LINE_X) * progress;
      noteBlock.visualObject.setX(x);
      
      // ===== 노트 파괴 및 MISS 판정 로직 =====
      // 노트의 '오른쪽 끝'이 HIT_LINE_X를 완전히 지나갔는지 판단합니다.
      // 노트의 오른쪽 끝 X 좌표 = visualObject.x + noteBlock.blockWidth
      const noteRightEdgeX = noteBlock.visualObject.x + noteBlock.blockWidth;
      
      // 홀드 블럭: 끝점이 기준선을 지나면 MISS 또는 파괴
      // 탭 블럭: 시작점이 기준선을 지나면 MISS 또는 파괴
      
      // 노트가 기준선을 완전히 통과했는지 확인하는 조건
      // 블록의 오른쪽 끝(x + width)이 기준선(HIT_LINE_X)을 넘어섰을 때
      if (noteRightEdgeX < this.HIT_LINE_X) {
        // 이미 히트하지 않은 노트라면 MISS 처리
        if (!noteBlock.isHit) {
          this.handleMissedNote(noteBlock, now);
        }
        // 블록 파괴
        noteBlock.visualObject.destroy();
        noteBlock.visualObject = null;
      }
    });
    this.scheduledNotes = this.scheduledNotes.filter(noteBlock => noteBlock.visualObject !== null);
  }
}