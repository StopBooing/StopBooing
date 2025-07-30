import Phaser from 'phaser';
import SongManager from './managers/SongManager.js';
import JudgmentManager from './managers/JudgmentManager.js';
import { 
  GAME_CONFIG, 
  JUDGMENT_COLORS, 
  NOTE_COLORS, 
  LANE_KEYS, 
  ANIMATION_CONFIG 
} from './constants/GameConstants.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import NoteBlock from './NoteBlock.js';

import socket from '../services/socket.js';
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
    
    if (!window.jamSceneCountdownStarted) {
      window.jamSceneCountdownStarted = false;
    }
  }

  init() {
    this.myInstrumentName = this.sys.game.registry.get('myInstrument');
    console.log(`JamScene: 나의 역할은 [${this.myInstrumentName}] 입니다.`);
  }

  create() {
    // Deemo 스타일: 밝은 흰색 계열 배경
    this.cameras.main.setBackgroundColor('#f7f6f3');
    this.myInstrumentName = this.game.registry.get('myInstrument');
    
    // SPAWN_Y는 카메라 높이에 의존하므로 create에서 계산
    this.SPAWN_Y = 0;
    this.HIT_LINE_Y = this.cameras.main.height - GAME_CONFIG.HIT_LINE_OFFSET;
    
    // SongManager를 통해 곡 데이터 로드하고 NoteBlock 인스턴스로 변환
    const noteData = this.songManager.getSongData(this.myInstrumentName);
    this.noteBlocks = noteData.map(data => new NoteBlock(data));
    
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
    
    // 게임 시작 시간 기록
    this.gameStartTime = performance.now();
  }

  createSessionUI() {
    // 세션 이름 매핑
    const sessionMapping = {
      'keyboard': 'piano',
      'guitar': 'guitar', 
      'drum': 'drum',
      'vocal': 'vocal'
    };

    this.sessionType = sessionMapping[this.myInstrumentName] || 'piano';
    
    // 세션별 UI 표시
    const sessionNames = {
      'piano': '피아노',
      'drum': '드럼', 
      'guitar': '일렉기타',
      'vocal': '보컬'
    };

    const displayName = sessionNames[this.sessionType] || this.sessionType;
    
    // 세션별 UI 표시
    this.add.text(400, 50, `${displayName} 세션`, { fontSize: '32px' }).setOrigin(0.5);
    // this.add.text(400, 300, `${displayName} 세션`, { fontSize: '20px' }).setOrigin(0.5);
    
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
    // 게임 시작 시간 기록
    this.gameStartTime = performance.now();
    this.currentBar = 0;

    // BPM 설정 (120 BPM = 0.5초/박)
    const bpm = 120;
    this.barDuration = 60 / bpm * 4; // 4박자 = 2초

    // 노트가 화면을 가로질러 이동하는 시간을 설정합니다.
    this.previewTimeSec = 1; // 1초 동안 화면을 이동
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
        // 디버깅: NoteBlock 정보 확인
        console.log(`Spawning note: key=${noteBlock.key}, lane=${noteBlock.lane}, yPos=${this.keyLanes[noteBlock.key]}`);
        
        const visualObject = this.spawnNoteVisual(noteBlock);
        noteBlock.visualObject = visualObject;
        this.scheduledNotes.push(noteBlock);
        console.log(`Note spawned and added to scheduledNotes. Total: ${this.scheduledNotes.length}`);
      };

      if (delaySec <= 0) {
        spawnNote();
      } else {
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
    // performance.now()는 마이크로초 정밀도 제공
    return (performance.now() - this.gameStartTime) / 1000;
  }

  // 더 정확한 타이밍을 위한 고정밀 시간 (밀리초 단위)
  getPreciseTime() {
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
    const gameWidth = this.RHYTHM_GAME_RIGHT - this.RHYTHM_GAME_LEFT;
    const laneSpacing = gameWidth / GAME_CONFIG.LANE_COUNT;
    const baseWidth = laneSpacing * GAME_CONFIG.NOTE.WIDTH_RATIO;
    let visualBlock;
    let blockHeight = 0;
    
    if (noteBlock.blockType === 'tap') {
      blockHeight = GAME_CONFIG.NOTE.TAP_HEIGHT;
      visualBlock = this.add.rectangle(0, 0, baseWidth, blockHeight, 0x00cc00).setOrigin(0.5, 0);
    } else if (noteBlock.blockType === 'hold') {
      blockHeight = this.noteSpeed * noteBlock.duration;
      const minHeight = GAME_CONFIG.NOTE.HOLD_MIN_HEIGHT;
      blockHeight = Math.max(minHeight, blockHeight);
      blockHeight = Math.max(minHeight, blockHeight - GAME_CONFIG.NOTE.SPACING_MARGIN);
      
      const holdGraphics = this.add.graphics();
      // 메인 블럭 (진한 파란색)
      holdGraphics.fillStyle(0x0088ff, 1);
      holdGraphics.fillRect(-baseWidth/2, 0, baseWidth, blockHeight);
      // 홀드 블럭의 끝 부분 (밝은 파란색)
      holdGraphics.fillStyle(0x00aaff, 1);
      holdGraphics.fillRect(-baseWidth/2, blockHeight - GAME_CONFIG.NOTE.HOLD_END_HEIGHT, baseWidth, GAME_CONFIG.NOTE.HOLD_END_HEIGHT);
      // 홀드 블럭의 시작 부분 (더 밝은 파란색)
      holdGraphics.fillStyle(0x00ccff, 1);
      holdGraphics.fillRect(-baseWidth/2, 0, baseWidth, GAME_CONFIG.NOTE.HOLD_START_HEIGHT);
      // 가운데 연결선 (세로선)
      holdGraphics.lineStyle(GAME_CONFIG.NOTE.LINE_WIDTH, 0xffffff, 0.8);
      holdGraphics.beginPath();
      holdGraphics.moveTo(0, 0);
      holdGraphics.lineTo(0, blockHeight);
      holdGraphics.strokePath();
      // 가운데 점들
      const dotCount = Math.floor(blockHeight / GAME_CONFIG.NOTE.DOT_INTERVAL);
      for (let i = 1; i < dotCount; i++) {
        const y = (blockHeight / dotCount) * i;
        holdGraphics.fillStyle(0xffffff, 0.9);
        holdGraphics.fillCircle(0, y, GAME_CONFIG.NOTE.DOT_SIZE);
      }
      visualBlock = holdGraphics;
    }
    
    noteBlock.blockHeight = blockHeight;
    const container = this.add.container(xPos, this.SPAWN_Y, [visualBlock]);
    this.noteVisualsGroup.add(container);
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
      const now = this.getCurrentTime();
      const hitNoteBlock = this.findNoteBlockToHit(keyId, now);
      
      if (hitNoteBlock) {
        // ▶ 추가: 현재 눌린 키(code)에 NoteBlock 인스턴스를 저장하여,
        //   keyup 시 해당 NoteBlock의 상태를 업데이트할 수 있도록 합니다.
        this.pressedKeys[code] = { keyId, noteBlock: hitNoteBlock };

        if (hitNoteBlock.blockType === 'tap') {
          hitNoteBlock.hit(now);
          this.updateComboAndScore(hitNoteBlock.accuracy);
          this.showAccuracyText(hitNoteBlock.accuracy, hitNoteBlock.lane, hitNoteBlock);
          
          // 효과음 재생
          this.playEffectSound(hitNoteBlock.accuracy);
          
          console.log(`Tap Block HIT: lane ${hitNoteBlock.lane}, Acc: ${hitNoteBlock.accuracy}`);
          
        } else if (hitNoteBlock.blockType === 'hold') {
          // 홀드 노트 시작
          hitNoteBlock.startHold(now);
          
          // 시작 판정 텍스트 표시
          this.showAccuracyText(hitNoteBlock.startAccuracy, hitNoteBlock.lane, hitNoteBlock);
          
          // 시작이 miss면 즉시 점수 업데이트
          if (hitNoteBlock.startAccuracy === 'miss') {
            this.updateComboAndScore('miss');
          }
          
          console.log(`Hold Block STARTED: lane ${hitNoteBlock.lane}, Start Acc: ${hitNoteBlock.startAccuracy}`);
        }
      } else {
        // 히트할 노트 블록이 없는 경우, 즉시 음을 재생하고 release 처리를 위한 dummy data를 pressedKeys에 저장
        // 이는 플레이어가 박자를 틀렸지만, 그래도 소리는 나게 하고 싶을 때 유용합니다.
        // 하지만 리듬 게임에서 '틀린 음'에 대한 시각적 피드백이나 점수 처리가 없다면 혼란을 줄 수 있습니다.
        // 현재는 warn 메시지만 출력합니다.
        console.warn(`No NoteBlock found for key '${keyId}' at this time. (This keyPress was not mapped to an active note block)`);
        
        // **옵션:** 틀린 음도 소리 나게 하고 싶을 경우 (점수/판정 없음)
        // const dummyChord = ['C4']; // 또는 해당 keyId에 대한 기본 음정
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
      
      if (pressedData) {
        const now = this.getCurrentTime();
        
        if (pressedData.noteBlock) { // NoteBlock과 연결된 키업이라면
                  if (pressedData.noteBlock.blockType === 'hold') {
          // 홀드 노트 종료
          pressedData.noteBlock.endHold(now);
          
          // 홀드 노트 최종 판정
          const holdDuration = now - pressedData.noteBlock.holdStartTime;
          const minHoldTime = pressedData.noteBlock.duration * 0.5;
          
          let finalAccuracy = pressedData.noteBlock.startAccuracy;
          if (holdDuration < minHoldTime) {
            finalAccuracy = 'miss'; // 홀드가 너무 짧으면 miss
          }
          
          pressedData.noteBlock.accuracy = finalAccuracy;
          
          this.updateComboAndScore(finalAccuracy);
          this.showAccuracyText(finalAccuracy, pressedData.noteBlock.lane, pressedData.noteBlock);
          
          // 효과음 재생
          this.playEffectSound(finalAccuracy);
          
          console.log(`Hold Block ENDED: lane ${pressedData.noteBlock.lane}, Final Acc: ${finalAccuracy}`);

        } else if (pressedData.noteBlock.blockType === 'tap') {
          // 탭 노트 홀드 오버 체크 (간단한 방식)
          const holdTime = now - pressedData.noteBlock.hitTime;
          if (holdTime > 0.3) { // 0.3초 이상 누르면 홀드 오버
            console.log(`Tap Block HOLD OVER: lane ${pressedData.noteBlock.lane}`);
          }
        }
        }
        
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
        hitWindow = noteBlock.duration + GAME_CONFIG.JUDGMENT_WINDOWS.MISS;
      } else {
        // 탭 블럭: 기본 히트 윈도우
        hitWindow = GAME_CONFIG.JUDGMENT_WINDOWS.MISS;
      }
      
      const timeDiff = Math.abs(currentTime - noteBlock.timing);
      return timeDiff <= hitWindow;
    });
  }

  // 정확도를 화면에 표시하는 메서드
  showAccuracyText(accuracy, lane, noteBlock = null) {
    console.log(`showAccuracyText called: accuracy=${accuracy}, lane=${lane}`);
    
    const color = this.judgmentManager.getJudgmentColor(accuracy);
    
    let x, y;
    if (noteBlock && noteBlock.visualObject) {
      // 노트 컨테이너의 현재 위치 바로 위에 표시
      x = noteBlock.visualObject.x;
      y = noteBlock.visualObject.y - 30;
    } else {
      // 기존 방식(레인 중앙, 기준선 위)
      x = this.keyLanes[this.getLaneKey(lane)] || this.cameras.main.width / 2;
      y = this.HIT_LINE_Y - 50;
    }
    
    console.log(`showAccuracyText - HIT_LINE_Y: ${this.HIT_LINE_Y}, laneX: ${x}, color: ${color}`);
    
    // 정확도 텍스트 생성
    const accuracyText = this.add.text(x, y, accuracy.toUpperCase(), {
      fontSize: ANIMATION_CONFIG.ACCURACY_TEXT.FONT_SIZE,
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: ANIMATION_CONFIG.ACCURACY_TEXT.STROKE_THICKNESS
    }).setOrigin(0.5);
    
    console.log(`showAccuracyText - text created at x: ${x}, y: ${y}`);
    
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
    
    // MISS 처리
    noteBlock.hit(currentTime);
    noteBlock.accuracy = 'miss';
    
    // MISS 텍스트 표시
    this.showAccuracyText('miss', noteBlock.lane, noteBlock);
    
    // 콤보 리셋
    this.currentCombo = 0;
    console.log('콤보 리셋!');
    
    console.log(`Note missed: lane ${noteBlock.lane}, timing ${noteBlock.timing}`);
  }

  // 콤보 및 점수 업데이트 메서드
  updateComboAndScore(accuracy) {
    console.log(`updateComboAndScore called with accuracy: ${accuracy}`);
    
    const result = this.judgmentManager.updateScoreAndCombo(accuracy);
    
    // React 컴포넌트에 정확도 업데이트 이벤트 발생
    this.game.events.emit('accuracyUpdate', result.accuracy);
    
    console.log(`Score updated: +${result.score} (Total: ${result.totalScore}), Combo: ${result.combo}, Accuracy: ${result.accuracy}%`);
  }

  // 정확도 업데이트 메서드 (JudgmentManager로 이동됨)
  updateAccuracy(accuracy) {
    // 이 메서드는 하위 호환성을 위해 유지하지만 실제로는 JudgmentManager를 사용
    console.warn('updateAccuracy is deprecated. Use judgmentManager.updateScoreAndCombo instead.');
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
            console.log(`Note found for held key '${pressedData.keyId}': ${hitNoteBlock.toString()}`);
          }
        }
      });
      
      this.scheduledNotes.forEach(noteBlock => {
        if (!noteBlock.visualObject || !noteBlock.visualObject.active) {
          return;
        }

        // 홀드 블럭 진행률 업데이트 및 시각적 피드백
        if (noteBlock.blockType === 'hold' && (noteBlock.isHolding || noteBlock.holdStartTime)) {
          this.updateHoldBlockVisual(noteBlock, now);
        }
        
        // 홀드 블럭 실시간 상태 체크
        this.checkHoldStatus(noteBlock, now);
        
        // 탭 블럭 홀드 오버 체크
        this.checkTapHoldOver(noteBlock, now);
        
        // 홀드 블럭 끝 판정 표시
        this.checkHoldEndJudgment(noteBlock, now);
        
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

  // 홀드 블록 시각적 업데이트
  updateHoldBlockVisual(noteBlock, now) {
    noteBlock.updateHoldProgress(now);
    
    if (noteBlock.visualObject && noteBlock.visualObject.list) {
      const graphics = noteBlock.visualObject.list[0];
      if (graphics) {
        graphics.clear();
        
        const gameWidth = this.RHYTHM_GAME_RIGHT - this.RHYTHM_GAME_LEFT;
        const laneSpacing = gameWidth / GAME_CONFIG.LANE_COUNT;
        const baseWidth = laneSpacing * GAME_CONFIG.NOTE.WIDTH_RATIO;
        
        const timeToHitStart = noteBlock.timing - now;
        const isHoldInProgress = noteBlock.isHolding && noteBlock.holdStartTime;
        
        // 색상 결정
        let mainColor, startColor, endColor, lineColor;
        if (isHoldInProgress && noteBlock.startAccuracy !== 'miss') {
          mainColor = NOTE_COLORS.HOLD.HOLDING;
          startColor = NOTE_COLORS.HOLD.HOLDING;
          endColor = NOTE_COLORS.HOLD.HOLDING;
          lineColor = 0xffffff;
        } else if (noteBlock.startAccuracy === 'miss') {
          // 시작이 miss면 빨간색으로 표시
          mainColor = NOTE_COLORS.TAP.HOLD_OVER;
          startColor = NOTE_COLORS.TAP.HOLD_OVER;
          endColor = NOTE_COLORS.TAP.HOLD_OVER;
          lineColor = 0xffffff;
        } else {
          mainColor = NOTE_COLORS.HOLD.DEFAULT;
          startColor = NOTE_COLORS.HOLD.START;
          endColor = NOTE_COLORS.HOLD.END;
          lineColor = 0xffffff;
        }
        
        // 메인 블럭
        graphics.fillStyle(mainColor, 1);
        graphics.fillRect(-baseWidth/2, 0, baseWidth, noteBlock.blockHeight);
        
        // 홀드 블럭의 끝 부분
        graphics.fillStyle(endColor, 1);
        graphics.fillRect(-baseWidth/2, noteBlock.blockHeight - GAME_CONFIG.NOTE.HOLD_END_HEIGHT, baseWidth, GAME_CONFIG.NOTE.HOLD_END_HEIGHT);
        
        // 홀드 블럭의 시작 부분
        graphics.fillStyle(startColor, 1);
        graphics.fillRect(-baseWidth/2, 0, baseWidth, GAME_CONFIG.NOTE.HOLD_START_HEIGHT);
        
        // 가운데 연결선
        graphics.lineStyle(GAME_CONFIG.NOTE.LINE_WIDTH, lineColor, 0.8);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(0, noteBlock.blockHeight);
        graphics.strokePath();
        
        // 연결선 위에 작은 점들
        const dotCount = Math.floor(noteBlock.blockHeight / GAME_CONFIG.NOTE.DOT_INTERVAL);
        for (let i = 1; i < dotCount; i++) {
          const y = (noteBlock.blockHeight / dotCount) * i;
          graphics.fillStyle(lineColor, 0.9);
          graphics.fillCircle(0, y, GAME_CONFIG.NOTE.DOT_SIZE);
        }
      }
    }
  }

  // 탭 블록 홀드 오버 체크
  checkTapHoldOver(noteBlock, now) {
    if (noteBlock.blockType === 'tap' && noteBlock.isHit && !noteBlock.isTapHoldOver) {
      const holdOverOccurred = noteBlock.checkTapHoldOver(now);
      if (holdOverOccurred) {
        this.updateComboAndScore(noteBlock.accuracy);
        this.showAccuracyText(noteBlock.accuracy, noteBlock.lane, noteBlock);
        if (noteBlock.visualObject && noteBlock.visualObject.setFillStyle) {
          noteBlock.visualObject.setFillStyle(NOTE_COLORS.TAP.HOLD_OVER);
        }
      }
    }
    
    // 탭 블록 홀드 오버 경고
    if (noteBlock.blockType === 'tap' && noteBlock.isHit && !noteBlock.isTapHoldOver && noteBlock.tapHoldStartTime) {
      const holdTime = now - noteBlock.tapHoldStartTime;
      if (holdTime > GAME_CONFIG.HOLD.TAP_HOLD_WARNING_TIME && holdTime <= noteBlock.maxTapHoldTime) {
        if (noteBlock.visualObject && noteBlock.visualObject.setFillStyle) {
          noteBlock.visualObject.setFillStyle(NOTE_COLORS.TAP.WARNING);
        }
      }
    }
  }

  // 홀드 블록 끝 판정 표시
  checkHoldEndJudgment(noteBlock, now) {
    if (noteBlock.blockType === 'hold' && noteBlock.isHit && !noteBlock.endAccuracyShown) {
      const timeToHitStart = noteBlock.timing - now;
      const timeToEndHit = timeToHitStart - (noteBlock.blockHeight / this.noteSpeed);
      
      if ((timeToEndHit < 0 || noteBlock.endAccuracy) && noteBlock.endAccuracy) {
        this.showAccuracyText(noteBlock.endAccuracy, noteBlock.lane, noteBlock);
        noteBlock.endAccuracyShown = true;
        console.log(`Hold Block end accuracy displayed: ${noteBlock.endAccuracy} for lane ${noteBlock.lane} (${now.toFixed(2)}s)`);
      }
    }
  }

  // 홀드 블록 실시간 체크 (중간에 키를 떼면 miss 처리)
  checkHoldStatus(noteBlock, now) {
    if (noteBlock.blockType === 'hold' && noteBlock.isHolding && !noteBlock.isCompleted) {
      // 홀드 중인 노트가 기준선을 지나갔는지 확인
      const timeToHitStart = noteBlock.timing - now;
      const timeToEndHit = timeToHitStart - (noteBlock.blockHeight / this.noteSpeed);
      
      // 노트가 완전히 지나갔는데 아직 홀드 중이면 miss 처리
      if (timeToEndHit < -0.1) {
        noteBlock.releaseHoldEarly(now);
        this.updateComboAndScore(noteBlock.accuracy);
        this.showAccuracyText(noteBlock.accuracy, noteBlock.lane, noteBlock);
        console.log(`Hold block missed: released too early at ${now.toFixed(2)}s`);
      }
    }
  }

  // 노트 위치 업데이트
  updateNotePosition(noteBlock, now) {
    const y = noteBlock.calculatePosition(now, this.SPAWN_Y, this.HIT_LINE_Y, this.previewTimeSec);
    if (noteBlock.visualObject) {
      noteBlock.visualObject.setY(y);
    }
  }

  // 노트 파괴 및 MISS 판정
  checkNoteDestruction(noteBlock, now) {
    if (noteBlock.shouldDestroy(now, this.noteSpeed, this.previewTimeSec)) {
      if (!noteBlock.isHit) {
        this.handleMissedNote(noteBlock, now);
      }
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
      
      // JudgmentManager 리셋
      this.judgmentManager.reset();
      
      console.log('JamScene cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}