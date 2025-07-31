import Phaser from 'phaser';
import SongManager from '../managers/SongManager.js';
import JudgmentManager from '../managers/JudgmentManager.js';
import { 
  GAME_CONFIG, 
  JUDGMENT_COLORS, 
  NOTE_COLORS, 
  SESSION_COLORS,
  LANE_KEYS, 
  ANIMATION_CONFIG 
} from '../constants/GameConstants.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { PerformanceMonitor } from '../../utils/PerformanceMonitor.js';
import NoteBlock from '../NoteBlock.js';

import socket from '../../services/socket.js';
// SongManager 인스턴스 생성
const songManager = new SongManager();


export default class JamScene extends Phaser.Scene {
  constructor() {
    super({ key: 'JamScene' });
    this.bpm = 100;
    this.myInstrumentName = null;
    this.sessionType = null;
    this.pressedKeys = {};
    this.songManager = songManager;
    this.judgmentManager = new JudgmentManager();
    this.performanceMonitor = new PerformanceMonitor();
    this.noteBlocks = [];
    this.currentBar = 0;
    this.barText = null;
    this.barDuration = 0;
    this.HIT_LINE_Y = 0; // 기준선의 Y 위치 (화면 아래) - constructor에서 초기화
    this.SPAWN_Y = 0; // create에서 계산될 예정 (화면 위)
    this.noteSpeed = 0;
    this.previewTimeSec = GAME_CONFIG.PREVIEW_TIME_SEC;
    this.scheduledNotes = [];
    this.keyPositions = {};
    this.isBarTransitioning = false;
    this.countdownStarted = false;
    this.audioInitialized = false;
    this.countdownTimer = null;
    
    // 게임 시작 시간 관련 변수
    this.gameStartTime = null;
    
    if (!window.jamSceneCountdownStarted) {
      window.jamSceneCountdownStarted = false;
    }
  }

  init() {
    this.myInstrumentName = this.sys.game.registry.get('myInstrument');
    console.log(`JamScene: 나의 역할은 [${this.myInstrumentName}] 입니다.`);
    
    // JamScene 진입 시점을 게임 시작 시간으로 설정
    this.gameStartTime = performance.now();
    console.log('JamScene 진입 - 게임 시작 시간 설정:', this.gameStartTime);
  }

  create() {
    // Deemo 스타일: 밝은 흰색 계열 배경
    this.cameras.main.setBackgroundColor('#f7f6f3');
    this.myInstrumentName = this.game.registry.get('myInstrument');
    console.log(`JamScene create: registry에서 가져온 myInstrument:`, this.game.registry.get('myInstrument'));
    console.log(`JamScene create: 설정된 myInstrumentName:`, this.myInstrumentName);
    
    // SPAWN_Y는 카메라 높이에 의존하므로 create에서 계산
    this.SPAWN_Y = 0;
    this.HIT_LINE_Y = this.cameras.main.height - GAME_CONFIG.HIT_LINE_OFFSET;
    
    // SongManager를 통해 곡 데이터 로드하고 NoteBlock 인스턴스로 변환
    const noteData = this.songManager.getSongData(this.myInstrumentName);
    console.log('로드된 노트 데이터:', noteData);
    
    // 모든 노트를 표시하되, 자신의 노트만 칠 수 있도록 함
    this.noteBlocks = noteData.map(data => new NoteBlock(data));
    
    console.log(`총 노트 개수: ${this.noteBlocks.length}`);
    this.noteBlocks.forEach((note, index) => {
      console.log(`노트 ${index}: ${note.toString()}, 세션: ${note.sessionType}`);
    });
    
    // noteSpeed 계산은 previewTimeSec과 HIT_LINE_Y에 의존
    const travelDistance = this.HIT_LINE_Y - this.SPAWN_Y;
    this.noteSpeed = travelDistance / this.previewTimeSec;
    
    this.setupTimingGuideUI();
    const laneKeys = this.songManager.getLaneKeys(this.myInstrumentName);
    
    // laneX 계산: 화면을 8등분하여 각 레인 X 위치 지정
    const gameWidth = this.cameras.main.width;
    const laneSpacing = gameWidth / GAME_CONFIG.LANE_COUNT;
    this.lane1X = laneSpacing * 0.5;
    this.lane2X = laneSpacing * 1.5;
    this.lane3X = laneSpacing * 2.5;
    this.lane4X = laneSpacing * 3.5;
    this.lane5X = laneSpacing * 4.5;
    this.lane6X = laneSpacing * 5.5;
    this.lane7X = laneSpacing * 6.5;
    this.lane8X = laneSpacing * 7.5;
    this.keyLanes = {
      [laneKeys[1]]: this.lane1X,
      [laneKeys[2]]: this.lane2X,
      [laneKeys[3]]: this.lane3X,
      [laneKeys[4]]: this.lane4X,
      [laneKeys[5]]: this.lane5X,
      [laneKeys[6]]: this.lane6X,
      [laneKeys[7]]: this.lane7X,
      [laneKeys[8]]: this.lane8X
    };
    
    this.createSessionUI();
    this.setupKeyboardInput();
    
    // 다른 플레이어의 정확도 수신 이벤트 리스너
    this.setupAccuracySync();
  }

  initAudio() {
    console.log('오디오 시스템 초기화');
    
    // 배경음악 설정
    this.bgMusic = new Audio('/assets/background.mp3'); // 배경음악 파일 경로
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.5;
    
    // 효과음 설정
    this.successSound = new Audio('/assets/success.mp3'); // 성공 효과음
    this.failSound = new Audio('/assets/fail.mp3'); // 실패 효과음
    
    // 게임 시작 시간은 startSongTracker에서만 설정하므로 여기서는 설정하지 않음
  }

  createSessionUI() {
    // 세션 타입 직접 사용 (매핑 제거)
    this.sessionType = this.myInstrumentName || 'keyboard';
    
    // 세션별 UI 표시
    const sessionNames = {
      'keyboard': '키보드',
      'drum': '드럼', 
      'guitar': '일렉기타',
      'vocal': '보컬',

    };

    const displayName = sessionNames[this.sessionType] || this.sessionType;
    
    // 세션별 UI 표시
    this.add.text(400, 50, `${displayName} 세션`, { fontSize: '32px' }).setOrigin(0.5);
    
    // 세션별 색상 안내
    const sessionColors = SESSION_COLORS[this.sessionType] || SESSION_COLORS.keyboard;
    const sessionColorHex = '#' + sessionColors.TAP.toString(16).padStart(6, '0');
    
    this.sessionColorText = this.add.text(400, 90, `Your Color: ${sessionColorHex}`, {
      fontSize: '18px',
      color: sessionColorHex,
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    // 협동 게임 안내
    this.coopText = this.add.text(400, 120, `Hit only ${this.sessionType} notes! (Other notes are dimmed)`, {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    // 카운트다운 시작
    this.startCountdown();
  }

  setupTimingGuideUI() {
    // Deemo 스타일: 밝은 배경에 어울리는 연한 회색/베이지 계열로 UI 색상 조정
    this.RHYTHM_GAME_LEFT = 0;
    this.RHYTHM_GAME_RIGHT = this.cameras.main.width;
    this.HIT_LINE_Y = this.cameras.main.height - 150;
    this.SPAWN_Y = 0;
    this.noteSpeed = 0;
    const gameWidth = this.RHYTHM_GAME_RIGHT - this.RHYTHM_GAME_LEFT;
    const laneSpacing = gameWidth / GAME_CONFIG.LANE_COUNT;
    this.guideLine1X = this.RHYTHM_GAME_LEFT + laneSpacing * 1;
    this.guideLine2X = this.RHYTHM_GAME_LEFT + laneSpacing * 2;
    this.guideLine3X = this.RHYTHM_GAME_LEFT + laneSpacing * 3;
    this.guideLine4X = this.RHYTHM_GAME_LEFT + laneSpacing * 4;
    this.guideLine5X = this.RHYTHM_GAME_LEFT + laneSpacing * 5;
    this.guideLine6X = this.RHYTHM_GAME_LEFT + laneSpacing * 6;
    this.guideLine7X = this.RHYTHM_GAME_LEFT + laneSpacing * 7;
    this.lane1X = this.RHYTHM_GAME_LEFT + laneSpacing * 0.5;
    this.lane2X = this.RHYTHM_GAME_LEFT + laneSpacing * 1.5;
    this.lane3X = this.RHYTHM_GAME_LEFT + laneSpacing * 2.5;
    this.lane4X = this.RHYTHM_GAME_LEFT + laneSpacing * 3.5;
    this.lane5X = this.RHYTHM_GAME_LEFT + laneSpacing * 4.5;
    this.lane6X = this.RHYTHM_GAME_LEFT + laneSpacing * 5.5;
    this.lane7X = this.RHYTHM_GAME_LEFT + laneSpacing * 6.5;
    this.lane8X = this.RHYTHM_GAME_LEFT + laneSpacing * 7.5;
    // 기준선 (수평선) - 더 굵고 명확하게 표시
    // 1. 검정색 굵은 선
    this.add.line(0, 0, this.RHYTHM_GAME_LEFT, this.HIT_LINE_Y, this.RHYTHM_GAME_RIGHT, this.HIT_LINE_Y, 0x000000, 1)
      .setOrigin(0)
      .setLineWidth(8);
    // 2. 노란색 얇은 선(겹쳐서 강조)
    this.add.line(0, 0, this.RHYTHM_GAME_LEFT, this.HIT_LINE_Y, this.RHYTHM_GAME_RIGHT, this.HIT_LINE_Y, 0xffeb3b, 1)
      .setOrigin(0)
      .setLineWidth(3);
    this.noteVisualsGroup = this.add.group();
    // 7개의 보조선(세로선) - 연한 회색
    const guideLineXPositions = [
      this.guideLine1X, this.guideLine2X, this.guideLine3X, this.guideLine4X,
      this.guideLine5X, this.guideLine6X, this.guideLine7X
    ];
    guideLineXPositions.forEach(x => {
      this.add.line(
        0, 0,
        x, this.SPAWN_Y, x, this.HIT_LINE_Y,
        0xd6d3ce, 0.5
      ).setOrigin(0);
    });
    // 키 입력 표시 등 나머지 로직은 그대로
    this.keyPressIndicators = {};
    const laneKeys = this.songManager.getLaneKeys(this.myInstrumentName);
    // 각 레인별로 원형 키 입력 표시 생성
    for (let lane = 1; lane <= GAME_CONFIG.LANE_COUNT; lane++) {
      const key = laneKeys[lane];
      const laneX = this[`lane${lane}X`];
      const indicatorGraphics = this.add.graphics();
      indicatorGraphics.fillStyle(0xffffff, 0.8);
      indicatorGraphics.fillCircle(laneX, this.HIT_LINE_Y, 25);
      indicatorGraphics.setVisible(false);
      indicatorGraphics.setDepth(2000);
      this.keyPressIndicators[key] = {
        graphics: indicatorGraphics,
        lane: lane,
        isPressed: false
      };
    }
  }

  startSongTracker() {
    this.currentBar = 0;

    // BPM 설정 (120 BPM = 0.5초/박)
    const bpm = 120;
    this.barDuration = 60 / bpm * 4; // 4박자 = 2초

    // 노트가 화면을 가로질러 이동하는 시간을 설정합니다.
    this.previewTimeSec = 2; // 2초 동안 화면을 이동 (더 부드러운 움직임)
    const travelDistance = this.HIT_LINE_Y - this.SPAWN_Y;
    this.noteSpeed = travelDistance / this.previewTimeSec;

    // 배경음악 시작
    this.startBackgroundMusic();

    // NoteBlock들을 타이밍에 따라 스케줄링합니다.
    console.log(`Starting song tracker with ${this.noteBlocks.length} notes`);
    this.noteBlocks.forEach((noteBlock, index) => {
      const hitTime = noteBlock.timing; // NoteBlock의 timing 속성 사용
      const spawnTime = hitTime - this.previewTimeSec;

      const now = this.getCurrentTime();
      const delaySec = spawnTime - now;

      console.log(`Note ${index}: key=${noteBlock.key}, lane=${noteBlock.lane}, timing=${noteBlock.timing}, spawnTime=${spawnTime}, delaySec=${delaySec}`);

      const spawnNote = () => {
        // 이미 스폰된 노트는 다시 스폰하지 않음
        if (noteBlock.visualObject) {
          console.log(`Note already spawned: ${noteBlock.toString()}`);
          return;
        }
        
        // 디버깅: NoteBlock 정보 확인
        console.log(`Spawning note: key=${noteBlock.key}, lane=${noteBlock.lane}, yPos=${this.keyLanes[noteBlock.key]}`);
        
        const visualObject = this.spawnNoteVisual(noteBlock);
        noteBlock.visualObject = visualObject;
        this.scheduledNotes.push(noteBlock);
        console.log(`Note spawned and added to scheduledNotes. Total: ${this.scheduledNotes.length}`);
      };

      if (delaySec <= 0) {
        console.log(`Note ${index} spawning immediately (delaySec <= 0)`);
        spawnNote();
      } else {
        console.log(`Note ${index} scheduled to spawn in ${delaySec} seconds`);
        this.time.delayedCall(delaySec * 1000, spawnNote, [], this);
      }
    });
  }

  // 배경음악 시작 메서드 (노트와 동기화)
  startBackgroundMusic() {
    if (this.bgMusic) {
      // 노트 스폰과 동일한 타이밍으로 배경음악 시작
      const musicStartDelay = this.previewTimeSec; // 노트 스폰과 동일한 딜레이
      
      this.bgMusic.currentTime = 0;
      this.bgMusic.volume = 0.5;
      
      setTimeout(() => {
        this.bgMusic.play().catch(error => {
          console.warn('배경음악 재생 실패:', error);
        });
        console.log('배경음악 시작 (노트와 동기화됨)');
      }, musicStartDelay * 1000);
    }
  }

  // 현재 게임 시간 가져오기 (초 단위, 고정밀)
  getCurrentTime() {
    // 게임 시작 시간이 설정되지 않은 경우 0 반환
    if (!this.gameStartTime) {
      return 0;
    }
    // performance.now()는 마이크로초 정밀도 제공
    return (performance.now() - this.gameStartTime) / 1000;
  }

  // 더 정확한 타이밍을 위한 고정밀 시간 (밀리초 단위)
  getPreciseTime() {
    // 게임 시작 시간이 설정되지 않은 경우 0 반환
    if (!this.gameStartTime) {
      return 0;
    }
    return performance.now() - this.gameStartTime;
  }

  // 효과음 재생 메서드
  playEffectSound(accuracy) {
    try {
      if (accuracy === 'perfect' || accuracy === 'good') {
        if (this.successSound) {
          this.successSound.currentTime = 0; // 재생 위치 초기화
          this.successSound.play().catch(error => {
            console.warn('성공 효과음 재생 실패:', error);
          });
        }
      } else if (accuracy === 'bad' || accuracy === 'miss') {
        if (this.failSound) {
          this.failSound.currentTime = 0; // 재생 위치 초기화
          this.failSound.play().catch(error => {
            console.warn('실패 효과음 재생 실패:', error);
          });
        }
      }
    } catch (error) {
      console.warn('효과음 재생 중 오류:', error);
    }
  }

  spawnNoteVisual(noteBlock) {
    const xPos = this.keyLanes[noteBlock.key] || this.cameras.main.width / 2;
    if (!this.keyLanes[noteBlock.key]) {
      console.warn(`Key '${noteBlock.key}' not found in keyLanes:`, this.keyLanes);
    }
    
    console.log(`Spawning visual for note: key=${noteBlock.key}, xPos=${xPos}, SPAWN_Y=${this.SPAWN_Y}`);
    
    const gameWidth = this.RHYTHM_GAME_RIGHT - this.RHYTHM_GAME_LEFT;
    const laneSpacing = gameWidth / GAME_CONFIG.LANE_COUNT;
    const baseWidth = laneSpacing * GAME_CONFIG.NOTE.WIDTH_RATIO;
    let visualBlock;
    let blockHeight = 0;
    
    // 탭 노트만 사용
    blockHeight = GAME_CONFIG.NOTE.TAP_HEIGHT;
    
    // 자신의 노트인지 확인하여 색상과 투명도 조정
    const isMyNote = noteBlock.sessionType === this.myInstrumentName;
    const tapColor = SESSION_COLORS[noteBlock.sessionType]?.TAP || SESSION_COLORS.keyboard.TAP;
    
    visualBlock = this.add.rectangle(0, 0, baseWidth, blockHeight, tapColor).setOrigin(0.5, 0);
    
    // 자신의 노트가 아니면 투명도를 낮춰서 구분
    if (!isMyNote) {
      visualBlock.setAlpha(0.3);
    }
    
    noteBlock.blockHeight = blockHeight;
    const container = this.add.container(xPos, this.SPAWN_Y, [visualBlock]);
    this.noteVisualsGroup.add(container);
    
    console.log(`Visual note created: x=${xPos}, y=${this.SPAWN_Y}, width=${baseWidth}, height=${blockHeight}, color=${tapColor}, isMyNote=${isMyNote}`);
    return container;
  }

  startCountdown() {
    console.log('startCountdown 호출됨');
    
    // 이미 카운트다운이 실행 중이거나 완료된 경우 확인
    if (this.countdownTimer || this.countdownStarted) {
      console.log('카운트다운 이미 실행 중 또는 완료됨 - 무시');
      return;
    }
    
    this.countdownStarted = true;
    
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

      // 오디오 시스템 초기화 (첫 번째 키 입력 시에만)
      if (!this.audioInitialized) {
        this.audioInitialized = true;
        this.initAudio();
        console.log('오디오 시스템 초기화 완료');
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
      console.log(`JamScene: HITfromCLIENT 전송 - myInstrumentName: ${this.myInstrumentName}`);
      socket.emit("HITfromCLIENT", this.myInstrumentName);

      // NoteBlock에서 해당 키와 타이밍에 맞는 노트 찾기
      const now = this.getCurrentTime();
      const hitNoteBlock = this.findNoteBlockToHit(keyId, now);
      
      if (hitNoteBlock) {
        // 탭 노트 히트 처리
        hitNoteBlock.hit(now);
        
        // 서버에 정확도 전송 (다른 플레이어들에게 브로드캐스트용)
        socket.emit('note_accuracy', {
          instrument: this.myInstrumentName,
          lane: hitNoteBlock.lane,
          accuracy: hitNoteBlock.accuracy,
          serverTime: now
        });
        
        this.updateComboAndScore(hitNoteBlock.accuracy);
        this.showAccuracyText(hitNoteBlock.accuracy, hitNoteBlock.lane, hitNoteBlock);
        
        // 효과음 재생
        this.playEffectSound(hitNoteBlock.accuracy);
        
        // console.log(`Tap Block HIT: lane ${hitNoteBlock.lane}, Acc: ${hitNoteBlock.accuracy}`);
      } else {
        // 자신의 노트가 아닌 경우 아무것도 하지 않음 (다른 플레이어의 정확도는 서버에서 받음)
        console.log(`No NoteBlock found for key '${keyId}' at this time.`);
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
      // console.log(`Key released: ${keyId} (Code: ${code})`);
      
      if (pressedData) {
        delete this.pressedKeys[code]; // 눌린 키 상태 해제
      }
    });
  }

  // NoteBlock에서 히트할 노트 찾기
  findNoteBlockToHit(keyId, currentTime) {
    const foundNote = this.scheduledNotes.find(noteBlock => {
      if (noteBlock.key !== keyId) return false;
      
      // 이미 히트한 노트는 제외
      if (noteBlock.isHit) return false;
      
      // 세션별 노트 히트 검증 (자신의 세션 타입 노트만 칠 수 있음)
      if (noteBlock.sessionType !== this.sessionType) {
        console.log(`다른 세션 노트 무시: ${noteBlock.sessionType} (내 세션: ${this.sessionType})`);
        return false;
      }
      
      // 탭 노트 히트 윈도우
      const hitWindow = GAME_CONFIG.JUDGMENT_WINDOWS.MISS;
      
      const timeDiff = Math.abs(currentTime - noteBlock.timing);
      return timeDiff <= hitWindow;
    });
    
    if (foundNote) {
      console.log(`자신의 노트 찾음: ${foundNote.sessionType} - 레인 ${foundNote.lane}`);
    }
    
    return foundNote;
  }

  // 정확도를 화면에 표시하는 메서드
  showAccuracyText(accuracy, lane, noteBlock = null, customX = null, isOtherPlayer = false) {
    // console.log(`showAccuracyText called: accuracy=${accuracy}, lane=${lane}`);
    
    const color = this.judgmentManager.getJudgmentColor(accuracy);
    
    let x, y;
    if (customX) {
      // 다른 플레이어의 정확도 표시용
      x = customX;
      y = this.HIT_LINE_Y - 50;
    } else if (noteBlock && noteBlock.visualObject) {
      // 노트 컨테이너의 현재 위치 바로 위에 표시
      x = noteBlock.visualObject.x;
      y = noteBlock.visualObject.y - 30;
    } else {
      // 기존 방식(레인 중앙, 기준선 위)
      x = this.keyLanes[this.getLaneKey(lane)] || this.cameras.main.width / 2;
      y = this.HIT_LINE_Y - 50;
    }
    
    // console.log(`showAccuracyText - HIT_LINE_Y: ${this.HIT_LINE_Y}, laneX: ${x}, color: ${color}`);
    
    // 정확도 텍스트 생성
    const accuracyText = this.add.text(x, y, accuracy.toUpperCase(), {
      fontSize: isOtherPlayer ? ANIMATION_CONFIG.ACCURACY_TEXT.FONT_SIZE * 0.8 : ANIMATION_CONFIG.ACCURACY_TEXT.FONT_SIZE,
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: ANIMATION_CONFIG.ACCURACY_TEXT.STROKE_THICKNESS,
      alpha: isOtherPlayer ? 0.7 : 1.0 // 다른 플레이어는 약간 투명하게
    }).setOrigin(0.5);
    
    // console.log(`showAccuracyText - text created at x: ${x}, y: ${y}`);
    
    // 애니메이션 효과 (아래로 내려가면서 페이드아웃)
    this.tweens.add({
      targets: accuracyText,
      y: accuracyText.y + ANIMATION_CONFIG.ACCURACY_TEXT.MOVE_DISTANCE,
      alpha: 0,
      duration: ANIMATION_CONFIG.ACCURACY_TEXT.DURATION,
      ease: 'Power2',
      onComplete: () => {
        accuracyText.destroy();
      }
    });
  }

  // 레인 번호를 키로 변환하는 헬퍼 메서드
  getLaneKey(lane) {
    return LANE_KEYS[lane] || '3';
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
    const laneX = this[`lane${lane}X`];
    const splashX = laneX;
    const splashY = this.HIT_LINE_Y;
    const splashContainer = this.add.container(splashX, splashY);
    splashContainer.setDepth(2000);
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0xffffff, 0.8);
    centerCircle.fillCircle(0, 0, 25);
    splashContainer.add(centerCircle);
    this.tweens.add({
      targets: centerCircle,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 400,
      ease: 'Power2'
    });
    this.time.delayedCall(450, () => {
      splashContainer.destroy();
    });
  }

  // 놓친 노트 처리 메서드
  handleMissedNote(noteBlock, currentTime) {
    if (noteBlock.isHit) return; // 이미 히트한 노트는 처리하지 않음
    
    // 자신의 노트만 miss 처리
    if (noteBlock.sessionType !== this.sessionType) {
      console.log(`다른 세션 노트 miss 무시: ${noteBlock.sessionType} (내 세션: ${this.sessionType})`);
      return;
    }
    
    // 이전 콤보 저장
    const previousCombo = this.judgmentManager.currentCombo;
    
    // MISS 처리
    noteBlock.hit(currentTime);
    noteBlock.accuracy = 'miss';
    
    // 서버에 miss 정보 전송 (다른 플레이어들에게 브로드캐스트용)
    socket.emit('note_miss', {
      instrument: this.myInstrumentName,
      lane: noteBlock.lane,
      serverTime: currentTime
    });
    
    // MISS 텍스트 표시
    this.showAccuracyText('miss', noteBlock.lane, noteBlock);
    
    // 콤보 및 점수 업데이트
    this.updateComboAndScore('miss');
    this.playEffectSound('miss');
    
    // 콤보 브레이크 시 특별 이벤트 발생
    if (previousCombo > 0) {
      this.game.events.emit('comboBreak', previousCombo);
      // console.log(`Combo broken! Previous combo: ${previousCombo}`);
    }
    
    console.log(`자신의 노트 miss: ${noteBlock.sessionType} - 레인 ${noteBlock.lane}`);
  }

  // 콤보 및 점수 업데이트 메서드
  updateComboAndScore(accuracy) {
    // console.log(`updateComboAndScore called with accuracy: ${accuracy}`);
    
    const result = this.judgmentManager.updateScoreAndCombo(accuracy);
    
    // React 컴포넌트에 게임 통계 업데이트 이벤트 발생
    this.game.events.emit('gameStatsUpdate', {
      combo: result.combo,
      accuracy: result.accuracy,
      score: result.totalScore
    });
    
    // 개별 이벤트도 발생 (하위 호환성)
    this.game.events.emit('accuracyUpdate', result.accuracy);
    this.game.events.emit('comboUpdate', result.combo);
    
    // console.log(`Score updated: +${result.score} (Total: ${result.totalScore}), Combo: ${result.combo}, Accuracy: ${result.accuracy}%`);
  }

  // 다른 플레이어의 정확도 동기화 설정
  setupAccuracySync() {
    socket.on('player_accuracy', (data) => {
      console.log(`player_accuracy 이벤트 수신:`, data);
      console.log(`내 악기: ${this.myInstrumentName}, 수신된 악기: ${data.instrument}`);
      
      // 내 악기가 아닌 경우에만 처리
      if (data.instrument !== this.myInstrumentName) {
        console.log(`다른 플레이어 정확도 수신: ${data.instrument} - ${data.accuracy}`);
        this.showOtherPlayerAccuracy(data);
      } else {
        console.log(`내 정확도는 무시 (이미 처리됨)`);
      }
    });

    // 다른 플레이어의 miss 정보 수신
    socket.on('player_miss', (data) => {
      console.log(`player_miss 이벤트 수신:`, data);
      console.log(`내 악기: ${this.myInstrumentName}, 수신된 악기: ${data.instrument}`);
      
      // 내 악기가 아닌 경우에만 처리
      if (data.instrument !== this.myInstrumentName) {
        console.log(`다른 플레이어 miss 수신: ${data.instrument} - 레인 ${data.lane}`);
        this.showOtherPlayerMiss(data);
      } else {
        console.log(`내 miss는 무시 (이미 처리됨)`);
      }
    });
  }

  // 다른 플레이어의 정확도를 표시하는 메서드
  showOtherPlayerAccuracy(data) {
    console.log(`showOtherPlayerAccuracy 호출: instrument=${data.instrument}, lane=${data.lane}, accuracy=${data.accuracy}`);
    
    // 실제 노트의 레인 정보를 직접 사용하여 X 위치 계산
    const laneX = this.getLaneXFromLaneNumber(data.lane);
    console.log(`계산된 laneX: ${laneX}`);
    
    if (laneX) {
      this.showAccuracyText(data.accuracy, data.lane, null, laneX, true);
    } else {
      console.warn(`laneX를 찾을 수 없음: lane=${data.lane}`);
      // fallback: 화면 중앙에 표시
      this.showAccuracyText(data.accuracy, data.lane, null, this.cameras.main.width / 2, true);
    }
  }

  // 다른 플레이어의 miss를 표시하는 메서드
  showOtherPlayerMiss(data) {
    console.log(`showOtherPlayerMiss 호출: instrument=${data.instrument}, lane=${data.lane}`);
    
    // 실제 노트의 레인 정보를 직접 사용하여 X 위치 계산
    const laneX = this.getLaneXFromLaneNumber(data.lane);
    console.log(`계산된 laneX: ${laneX}`);
    
    if (laneX) {
      this.showAccuracyText('miss', data.lane, null, laneX, true);
    } else {
      console.warn(`laneX를 찾을 수 없음: lane=${data.lane}`);
      // fallback: 화면 중앙에 표시
      this.showAccuracyText('miss', data.lane, null, this.cameras.main.width / 2, true);
    }
  }

  // 레인 번호로 X 위치 가져오기 (실제 노트 레인 정보 사용)
  getLaneXFromLaneNumber(lane) {
    console.log(`getLaneXFromLaneNumber 호출: lane=${lane}`);
    
    if (lane >= 1 && lane <= 8) {
      const laneX = this[`lane${lane}X`];
      console.log(`lane${lane}X: ${laneX}`);
      return laneX;
    }
    
    console.warn(`유효하지 않은 레인 번호: ${lane}`);
    return null;
  }

  // 악기별 레인 X 위치 가져오기 (기존 메서드 - 하위 호환성)
  getLaneXForInstrument(instrument, lane) {
    console.log(`getLaneXForInstrument 호출: instrument=${instrument}, lane=${lane}`);
    
    // 악기별로 다른 레인 영역을 사용하도록 매핑
    const instrumentLaneMapping = {
      'vocal': 1,      // 보컬: 1-2번 레인
      'keyboard': 3,   // 키보드: 3-4번 레인
      'drum': 5,       // 드럼: 5-6번 레인
      'guitar': 7      // 기타: 7-8번 레인
    };
    
    const baseLane = instrumentLaneMapping[instrument];
    console.log(`baseLane: ${baseLane}`);
    
    if (baseLane && lane >= 1 && lane <= 8) { // 모든 레인 범위 지원
      const targetLane = baseLane + lane - 1;
      console.log(`targetLane: ${targetLane}`);
      
      if (targetLane >= 1 && targetLane <= 8) {
        const laneX = this[`lane${targetLane}X`];
        console.log(`lane${targetLane}X: ${laneX}`);
        return laneX;
      }
    }
    
    console.warn(`유효하지 않은 레인: instrument=${instrument}, lane=${lane}`);
    return null;
  }

  // 정확도 업데이트 메서드 (JudgmentManager로 이동됨)
  updateAccuracy(accuracy) {
    // 이 메서드는 하위 호환성을 위해 유지하지만 실제로는 JudgmentManager를 사용
    // console.warn('updateAccuracy is deprecated. Use judgmentManager.updateScoreAndCombo instead.');
    
    // 정확도 업데이트 이벤트 발생
    const currentAccuracy = this.judgmentManager.getCurrentAccuracy();
    this.game.events.emit('accuracyUpdate', currentAccuracy);
  }

  getKeyIdentifier(event) {
    const key = event.key;
    const code = event.code;

    // 모디파이어 키 자체의 입력을 무시합니다.
    if (['Alt', 'Meta', 'CapsLock'].includes(key)) {
      return null;
    }

    // CapsLock 상태를 처리합니다.
    if (event.getModifierState && event.getModifierState('CapsLock')) {
      return `capslock+${key.toLowerCase()}`;
    }

    // 키 코드를 기반으로 매핑 (8키)
    const keyMapping = {
      'KeyA': 'a',
      'KeyS': 's', 
      'KeyD': 'd',
      'KeyF': 'f',
      'KeyJ': 'j',
      'KeyK': 'k',
      'KeyL': 'l',
      'Semicolon': ';'
    };

    if (keyMapping[code]) {
      return keyMapping[code];
    }

    // 일반 키는 event.key를 그대로 사용합니다.
    return key.toLowerCase();
  }
  
  update(time, delta) {
    this.performanceMonitor.startFrame();
    
    try {
      const now = this.getCurrentTime(); // 게임 시간
      
      // 현재 누르고 있는 키들에 대해 노트 찾기 시도
      Object.keys(this.pressedKeys).forEach(code => {
        const pressedData = this.pressedKeys[code];
        if (pressedData && !pressedData.noteBlock) {
          // 노트가 할당되지 않은 키에 대해 노트 찾기 시도
          const hitNoteBlock = this.findNoteBlockToHit(pressedData.keyId, now);
          if (hitNoteBlock) {
            // 노트를 찾았으면 할당
            pressedData.noteBlock = hitNoteBlock;
            // console.log(`Note found for held key '${pressedData.keyId}': ${hitNoteBlock.toString()}`);
          }
        }
      });
      
      this.scheduledNotes.forEach(noteBlock => {
        if (!noteBlock.visualObject || !noteBlock.visualObject.active) {
          return;
        }
        
        // 노트 위치 업데이트
        this.updateNotePosition(noteBlock, now);
        
        // 노트 파괴 및 MISS 판정
        this.checkNoteDestruction(noteBlock, now);
      });
      
      // 파괴된 노트 제거
      this.scheduledNotes = this.scheduledNotes.filter(noteBlock => noteBlock.visualObject !== null);
      
      // 성능 모니터링 업데이트
      this.performanceMonitor.updateNoteCount(this.scheduledNotes.length);
      
    } catch (error) {
      ErrorHandler.handleError(error, 'JamScene.update');
    } finally {
      this.performanceMonitor.endFrame();
    }
  }



  // 노트 위치 업데이트
  updateNotePosition(noteBlock, now) {
    // 노트가 아직 스폰되지 않았거나 이미 파괴된 경우 업데이트하지 않음
    if (!noteBlock.visualObject || !noteBlock.visualObject.active) {
      return;
    }
    
    const y = noteBlock.calculatePosition(now, this.SPAWN_Y, this.HIT_LINE_Y, this.previewTimeSec);
    
    // 유효한 Y 위치인지 확인
    if (isFinite(y) && y >= this.SPAWN_Y - 100 && y <= this.HIT_LINE_Y + 100) {
      noteBlock.visualObject.setY(y);
    } else {
      console.warn(`Invalid Y position for note: ${y}, note: ${noteBlock.toString()}`);
    }
  }

  // 노트 파괴 및 MISS 판정
  checkNoteDestruction(noteBlock, now) {
    // 노트가 이미 파괴되었거나 시각적 객체가 없는 경우 처리하지 않음
    if (!noteBlock.visualObject || !noteBlock.visualObject.active) {
      return;
    }
    
    if (noteBlock.shouldDestroy(now, this.noteSpeed, this.previewTimeSec)) {
      if (!noteBlock.isHit && !noteBlock.isCompleted) {
        this.handleMissedNote(noteBlock, now);
      }
      
      // 시각적 객체 제거
      if (noteBlock.visualObject) {
        noteBlock.visualObject.destroy();
        noteBlock.visualObject = null;
      }
    }
  }



  // 리소스 정리
  cleanup() {
    try {
      // 타이머 정리
      if (this.countdownTimer) {
        clearTimeout(this.countdownTimer);
        this.countdownTimer = null;
      }
      
      // 노트 블록 정리
      this.scheduledNotes.forEach(noteBlock => {
        if (noteBlock.visualObject) {
          noteBlock.visualObject.destroy();
          noteBlock.visualObject = null;
        }
      });
      this.scheduledNotes = [];
      
      // 키 입력 상태 정리
      this.pressedKeys = {};
      
      // 이벤트 리스너 정리
      if (this.input && this.input.keyboard) {
        this.input.keyboard.off('keydown');
        this.input.keyboard.off('keyup');
      }
      
      // 소켓 이벤트 리스너 정리
      socket.off('player_accuracy');
      socket.off('player_miss');
      
      // JudgmentManager 리셋
      this.judgmentManager.reset();
      
      console.log('JamScene cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}