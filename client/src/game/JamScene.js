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
    this.barDuration = 0;
    this.HIT_LINE_Y = 500;
    this.SPAWN_Y = 100;
    this.noteSpeed = 0;
    this.scheduledNotes = []; // NoteBlock 객체들을 저장
    this.keyPositions = {};
    this.isBarTransitioning = false; // 마디 트랜지션 중복 방지
    this.countdownStarted = false; // 카운트다운 시작 여부
    this.audioInitialized = false; // AudioContext 초기화 여부
    this.countdownTimer = null; // 카운트다운 타이머 객체
    this.currentCombo = 0; // 현재 콤보 수
    this.totalScore = 0; // 총 점수
    
    // 전역 카운트다운 상태 관리 (Scene 재시작에도 유지)
    if (!window.jamSceneCountdownStarted) {
      window.jamSceneCountdownStarted = false;
    }
  }

  init() {
    this.myInstrumentName = this.sys.game.registry.get('myInstrument');
    this.socket = this.sys.game.registry.get('socket');
    console.log(`JamScene: 나의 역할은 [${this.myInstrumentName}] 입니다.`);
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
    this.RHYTHM_GAME_TOP = 0;    // 리듬게임 영역 상단
    this.RHYTHM_GAME_BOTTOM = this.cameras.main.height; // 리듬게임 영역 하단
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

    // === 3개의 보조선(가로선) 추가 (블럭 사이의 경계) ===
    const guideLineYPositions = [this.guideLine1Y, this.guideLine2Y, this.guideLine3Y];
    guideLineYPositions.forEach(y => {
      this.add.line(
        0, 0,
        this.HIT_LINE_X, y, this.SPAWN_X, y,
        0xcccccc, 0.4 // 연한 회색, 적절한 투명도
      ).setOrigin(0);
    });

    // === 키 입력 표시를 위한 그래픽 객체들 생성 ===
    this.keyPressIndicators = {};
    const laneKeys = this.songManager.getLaneKeys(this.myInstrumentName);
    
    // 각 레인별로 키 입력 표시 생성
    for (let lane = 1; lane <= 4; lane++) {
      const key = laneKeys[lane];
      const laneY = this[`lane${lane}Y`];
      
      // 키 입력 표시 (기준선 부분에 작은 사각형)
      const indicator = this.add.rectangle(
        this.HIT_LINE_X - 10, // 기준선 왼쪽에 위치
        laneY,
        20, // 가로 길이
        30, // 세로 길이
        0x00ff00, // 초록색 (기본)
        0.7 // 투명도
      ).setOrigin(0.5);
      
      // 초기에는 숨김
      indicator.setVisible(false);
      
      this.keyPressIndicators[key] = {
        graphics: indicator,
        lane: lane,
        isPressed: false
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
    
    // 디버깅: 키와 Y 위치 확인
    if (!this.keyLanes[noteBlock.key]) {
      console.warn(`Key '${noteBlock.key}' not found in keyLanes:`, this.keyLanes);
    }

    // 기준선 한칸의 크기 계산 (laneSpacing과 동일)
    const gameHeight = this.RHYTHM_GAME_BOTTOM - this.RHYTHM_GAME_TOP;
    const laneSpacing = gameHeight / 4; // 기준선 한칸의 크기
    const baseHeight = laneSpacing; // 블럭 높이를 기준선 한칸 크기와 같게 설정
    
    // 블럭 타입에 따른 디자인 적용
    let visualBlock;
    let blockWidth = 0; // 블럭 너비를 저장할 변수
    
    if (noteBlock.blockType === 'tap') {
      // 탭 블럭: 짧고 굵은 디자인
      blockWidth = 20; // 고정된 짧은 너비
      visualBlock = this.add.rectangle(0, 0, blockWidth, baseHeight, 0x00ff00).setOrigin(0, 0.5);
      
      // 탭 블럭은 더 진한 색상으로 구분
      visualBlock.setFillStyle(0x00cc00);
      
    } else if (noteBlock.blockType === 'hold') {
      // 홀드 블럭: 길고 홀드형 디자인
      const durationMultiplier = 2; // 길이 배수 (조절 가능)
      const minWidth = 30; // 최소 너비
      blockWidth = Math.max(minWidth, noteBlock.duration * 100 * durationMultiplier);
      
      // 홀드 블럭은 그라데이션 효과를 위해 여러 사각형으로 구성
      const holdBlock = this.add.container(0, 0);
      
      // 메인 블럭 (진한 색상)
      const mainBlock = this.add.rectangle(0, 0, blockWidth, baseHeight, 0x0088ff).setOrigin(0, 0.5);
      
      // 홀드 블럭의 끝 부분 (밝은 색상으로 구분)
      const endBlock = this.add.rectangle(blockWidth - 5, 0, 10, baseHeight, 0x00aaff).setOrigin(0, 0.5);
      
      // 홀드 블럭의 시작 부분 (더 밝은 색상)
      const startBlock = this.add.rectangle(5, 0, 10, baseHeight, 0x00ccff).setOrigin(0, 0.5);
      
      holdBlock.add([mainBlock, endBlock, startBlock]);
      visualBlock = holdBlock;
    }
    
    // 디버깅: 블럭 타입과 크기 정보 출력
    console.log(`NoteBlock 생성: type=${noteBlock.blockType}, duration=${noteBlock.duration}s, width=${blockWidth}px, note=${noteBlock.note}`);

    // 컨테이너를 화면 오른쪽에서 시작하도록 설정
    // 블럭의 시작점이 SPAWN_X에 위치하도록 조정
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

      // AudioContext 시작 (첫 번째 키 입력 시에만)
      if (!this.audioInitialized) {
        this.audioInitialized = true;
        this.initToneAudio();
      }

      const code = event.code;
      if (this.pressedKeys[code] || !this.activeInstrument) {
        return;
      }

      const keyId = this.getKeyIdentifier(event);
      if (!keyId) return;

      // 키 입력 표시 활성화
      this.showKeyPressIndicator(keyId, true);

      // NoteBlock에서 해당 키와 타이밍에 맞는 노트 찾기
      const now = Tone.now();
      const hitNoteBlock = this.findNoteBlockToHit(keyId, now);
      
      if (hitNoteBlock) {
        // 블럭 타입에 따른 처리
        if (hitNoteBlock.blockType === 'tap') {
          // 탭 블럭: 한 번만 누르면 됨
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
          
          console.log(`Tap Block hit: ${hitNoteBlock.toString()}, Accuracy: ${accuracy}, Score: ${hitNoteBlock.score}, Combo: ${this.currentCombo}, Total: ${this.totalScore}`);
          
        } else if (hitNoteBlock.blockType === 'hold') {
          // 홀드 블럭: 홀드 시작
          hitNoteBlock.startHold(now);
          
          // 악기 연주 (홀드 중에는 계속 소리 재생)
          const notes = hitNoteBlock.note.split(',');
          this.activeInstrument.handleAttack(notes);
          this.pressedKeys[code] = { keyId, chord: notes, noteBlock: hitNoteBlock };
          
          console.log(`Hold Block started: ${hitNoteBlock.toString()}`);
        }
      } else {
        console.warn(`No NoteBlock found for key '${keyId}' at this time.`);
      }
    });

    this.input.keyboard.on('keyup', (event) => {
      const code = event.code;

      // 키 입력 표시 비활성화
      const keyId = this.getKeyIdentifier(event);
      if (keyId) {
        this.showKeyPressIndicator(keyId, false);
      }

      // 키를 떼면 해당 소리를 멈춥니다.
      const pressedData = this.pressedKeys[code];
      if (pressedData && this.activeInstrument) {
        // 홀드 블럭인 경우 홀드 종료 처리
        if (pressedData.noteBlock && pressedData.noteBlock.blockType === 'hold') {
          const now = Tone.now();
          pressedData.noteBlock.endHold(now);
          
          // 홀드 완료도에 따른 점수 및 콤보 업데이트
          this.updateComboAndScore(pressedData.noteBlock.accuracy);
          
          // 홀드 완료 메시지 표시
          const holdMessage = pressedData.noteBlock.holdProgress >= 0.8 ? 'PERFECT HOLD' : 
                             pressedData.noteBlock.holdProgress >= 0.5 ? 'GOOD HOLD' : 'BAD HOLD';
          this.showAccuracyText(holdMessage, pressedData.noteBlock.lane);
          
          console.log(`Hold Block ended: ${pressedData.noteBlock.toString()}, Progress: ${Math.round(pressedData.noteBlock.holdProgress * 100)}%, Score: ${pressedData.noteBlock.score}`);
        }
        
        this.activeInstrument.handleRelease(pressedData.chord);
        delete this.pressedKeys[code];
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

  // 키 입력 표시를 제어하는 메서드
  showKeyPressIndicator(keyId, isPressed) {
    const indicator = this.keyPressIndicators[keyId];
    if (!indicator) return;

    indicator.isPressed = isPressed;
    
    if (isPressed) {
      // 키를 누르고 있을 때: 빨간색으로 변경하고 표시
      indicator.graphics.setFillStyle(0xff0000, 0.8);
      indicator.graphics.setVisible(true);
    } else {
      // 키를 떼었을 때: 숨김
      indicator.graphics.setVisible(false);
    }
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
  
  update(time, delta) {
    if (Tone.Transport.state !== 'started') return;
    
    const now = Tone.now();
    const travelTimeSeconds = this.previewTimeSec;

    this.scheduledNotes.forEach(noteBlock => {
      if (!noteBlock.visualObject || !noteBlock.visualObject.active) {
        return;
      }

      // 홀드 블럭 진행률 업데이트 및 시각적 피드백
      if (noteBlock.blockType === 'hold' && noteBlock.isHolding) {
        noteBlock.updateHoldProgress(now);
        
        // 홀드 중일 때 블럭 색상 변경 (시각적 피드백)
        if (noteBlock.visualObject && noteBlock.visualObject.list) {
          // 컨테이너 내의 메인 블럭 색상 변경
          const mainBlock = noteBlock.visualObject.list[0];
          if (mainBlock && mainBlock.setFillStyle) {
            // 진행률에 따라 색상 변화 (파란색 → 노란색 → 주황색)
            if (noteBlock.holdProgress >= 0.8) {
              mainBlock.setFillStyle(0x00ff00); // 완료 시 초록색
            } else if (noteBlock.holdProgress >= 0.5) {
              mainBlock.setFillStyle(0xffff00); // 진행 중 노란색
            } else {
              mainBlock.setFillStyle(0xff8800); // 시작 시 주황색
            }
          }
        }
      }

      const timeToHit = noteBlock.expectedHitTime - now;

      // 노트가 화면에 보여야 하는 시간 범위 내에 있는지 확인
      if (timeToHit >= -0.1 && timeToHit <= travelTimeSeconds) {
        // 오른쪽에서 왼쪽으로 이동하는 계산
        const progress = 1 - (timeToHit / travelTimeSeconds);
        const x = this.SPAWN_X - (this.SPAWN_X - this.HIT_LINE_X) * progress;
        noteBlock.visualObject.x = x;
        
        // 블럭의 시작점이 히트 라인을 지나간 노트는 MISS 처리
        // 블럭의 시작점이 히트 라인을 지나면 MISS
        if (timeToHit < -0.1 && !noteBlock.isHit) {
          this.handleMissedNote(noteBlock, now);
        }
      } else if (timeToHit < -0.1) {
        // 기준선을 지나간 노트는 제거3
        if (!noteBlock.isHit) {
          this.handleMissedNote(noteBlock, now);
        }
        noteBlock.visualObject.destroy();
        noteBlock.visualObject = null;
      }
    });

    this.scheduledNotes = this.scheduledNotes.filter(noteBlock => noteBlock.visualObject !== null);
  }
}