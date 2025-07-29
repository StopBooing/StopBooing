export default class NoteBlock {
  constructor({
    note,           // 음 (예: 'C4', 'E4', 'G4')
    timing,         // 나올 타이밍 (초 단위)
    duration = 0.5, // 길이 (초 단위, 기본값 0.5초)
    lane,           // 레인 번호 (1-4)
    key,            // 입력 키 (예: '8', '9', '0')
    bar,            // 마디 번호
    beat,           // 박자 위치 (마디 내에서의 위치)
    accuracy = null, // 정확도 (perfect, good, bad, miss)
    isHit = false,  // 히트 여부
    visualObject = null, // Phaser 시각적 객체
    hitTime = null, // 실제 히트 시간
    expectedHitTime = null, // 예상 히트 시간
    score = 0,      // 점수
    combo = 0,      // 콤보 수
    blockType = null // 블럭 타입 (tap, hold) - 자동 계산됨
  }) {
    this.note = note;
    this.timing = timing;
    this.duration = duration;
    this.lane = lane;
    this.key = key;
    this.bar = bar;
    this.beat = beat;
    this.accuracy = accuracy;
    this.isHit = isHit;
    this.visualObject = visualObject;
    this.hitTime = hitTime;
    this.expectedHitTime = expectedHitTime;
    this.score = score;
    this.combo = combo;
    this.blockWidth = 0; // 블럭의 너비 (픽셀)
    
    // 블럭 타입 자동 계산 (duration 기반)
    this.blockType = this.calculateBlockType();
    
    // 홀드 블럭 관련 상태
    this.isHolding = false; // 홀드 중인지 여부
    this.holdStartTime = null; // 홀드 시작 시간
    this.holdEndTime = null; // 홀드 종료 시간
    this.holdProgress = 0; // 홀드 진행률 (0~1)
    this.minHoldTime = this.duration * 0.5; // 최소 홀드 시간 (duration의 50%)
    this.isHoldTooShort = false; // 홀드가 너무 짧은지 여부
    
    // 탭 블럭 홀드 오버 관련 상태
    this.isTapHoldOver = false; // 탭 블럭을 너무 오래 누르고 있는지 여부
    this.tapHoldStartTime = null; // 탭 블럭 홀드 시작 시간
    this.maxTapHoldTime = 0.3; // 탭 블럭 최대 홀드 시간 (초)
    
    // 홀드 블럭 시작/끝 판정 저장
    this.startAccuracy = null;
    this.endAccuracy = null;
    this.endAccuracyShown = false; // 끝 판정 텍스트가 이미 표시되었는지 확인
    this.startAccuracyShown = false; // 시작 판정 텍스트가 이미 표시되었는지 확인
    
    // Hold 블럭 완료 상태
    this.isCompleted = false; // Hold 블럭이 완료되었는지 여부
    
    // 생성 시간 기록
    this.createdAt = Date.now();
    
    // 고유 ID 생성
    this.id = this.generateId();
  }

  // 블럭 타입 계산 (duration 기반)
  calculateBlockType() {
    // 0.75박자 이상이면 홀드 블럭, 그 이하면 탭 블럭
    return this.duration >= 0.75 ? 'hold' : 'tap';
  }

  // 홀드 블럭 시작
  startHold(hitTime) {
    if (this.blockType === 'hold') {
      // 이미 홀드 중이 아닐 때만 홀드 시작
      if (!this.isHolding) {
        this.isHolding = true;
        this.holdStartTime = hitTime;
        this.isHit = true; // Hold 블럭 시작 시 isHit을 true로 설정
        this.hitTime = hitTime; // 실제 히트 시간 설정
        
        // 시작 타이밍 판정
        this.startAccuracy = this.judgeAccuracy(hitTime);
        console.log(`Hold started: ${this.startAccuracy} (${hitTime.toFixed(2)}s)`);
      }
      // 늦게 눌렀을 때도 홀드 상태 유지 (이미 홀드 중이면 아무것도 하지 않음)
    }
  }

  // 홀드 블럭 종료
  endHold(endTime) {
    if (this.blockType === 'hold' && this.isHolding) {
      this.isHolding = false;
      this.holdEndTime = endTime;
      
      // 홀드 진행률 계산
      if (this.holdStartTime && this.expectedHitTime) {
        const totalHoldTime = this.duration;
        const actualHoldTime = endTime - this.holdStartTime;
        this.holdProgress = Math.min(1, actualHoldTime / totalHoldTime);
        
        // 끝 타이밍 판정
        const expectedEndTime = this.expectedHitTime + this.duration;
        const endTimeDiff = Math.abs(endTime - expectedEndTime);
        
        let endAccuracy;
        if (endTime < expectedEndTime - 0.2) {
          // 너무 일찍 뗌
          endAccuracy = 'miss';
        } else if (endTime < expectedEndTime - 0.1) {
          // 일찍 뗌
          endAccuracy = 'bad';
        } else if (endTime > expectedEndTime + 0.2) {
          // 너무 늦게 뗌
          endAccuracy = 'bad';
        } else if (endTime > expectedEndTime + 0.1) {
          // 늦게 뗌
          endAccuracy = 'good';
        } else {
          // 정확한 타이밍
          endAccuracy = 'perfect';
        }
        
        this.endAccuracy = endAccuracy;
        console.log(`Hold ended: ${endAccuracy} (${endTime.toFixed(2)}s, expected: ${expectedEndTime.toFixed(2)}s)`);
        

        
        // 점수 계산 (끝 판정 기준)
        this.accuracy = this.endAccuracy;
        this.calculateScore();
        console.log(`End accuracy: ${this.endAccuracy}`);
        
        // Hold 블럭 완료 상태로 설정
        this.isCompleted = true;
        console.log(`Hold block completed: ${this.toString()}`);
      }
    }
  }

  // 홀드 블럭 업데이트 (진행률 계산)
  updateHoldProgress(currentTime) {
    if (this.blockType === 'hold' && this.isHolding && this.holdStartTime) {
      const elapsed = currentTime - this.holdStartTime;
      this.holdProgress = Math.min(1, elapsed / this.duration);
    }
  }

  // 홀드 블럭 실시간 체크 (너무 짧게 누르고 있는지)
  checkHoldTooShort(currentTime) {
    if (this.blockType === 'hold' && this.isHolding && this.holdStartTime && !this.isHoldTooShort) {
      const holdTime = currentTime - this.holdStartTime;
      if (holdTime < this.minHoldTime) {
        // 아직 최소 홀드 시간에 도달하지 않음
        return false;
      }
    }
    return true; // 충분히 홀드했거나 홀드 블럭이 아님
  }

  // 탭 블럭 홀드 오버 시작
  startTapHold(hitTime) {
    if (this.blockType === 'tap' && !this.isTapHoldOver) {
      this.tapHoldStartTime = hitTime;
    }
  }

  // 탭 블럭 홀드 오버 체크
  checkTapHoldOver(currentTime) {
    if (this.blockType === 'tap' && this.tapHoldStartTime && !this.isTapHoldOver) {
      const holdTime = currentTime - this.tapHoldStartTime;
      if (holdTime > this.maxTapHoldTime) {
        this.isTapHoldOver = true;
        // 홀드 오버 시 정확도를 'bad'로 변경하고 점수 감점
        this.accuracy = 'bad';
        this.calculateScore();
        return true; // 홀드 오버 발생
      }
    }
    return false; // 홀드 오버 없음
  }

  // 탭 블럭 홀드 종료
  endTapHold(endTime) {
    if (this.blockType === 'tap' && this.tapHoldStartTime) {
      const holdTime = endTime - this.tapHoldStartTime;
      
      // 홀드 오버가 발생했는지 확인
      if (holdTime > this.maxTapHoldTime) {
        this.isTapHoldOver = true;
        // 홀드 오버 시 정확도를 'bad'로 변경
        if (this.accuracy === 'perfect' || this.accuracy === 'good') {
          this.accuracy = 'bad';
          this.calculateScore();
        }
      }
      
      this.tapHoldStartTime = null;
    }
  }

  // 고유 ID 생성 메서드
  generateId() {
    return `${this.bar}-${this.beat}-${this.lane}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 블럭 히트 처리
  hit(hitTime, accuracy = null) {
    this.isHit = true;
    this.hitTime = hitTime;
    this.accuracy = accuracy;
    
    // 정확도에 따른 점수 계산
    this.calculateScore();
  }

  // 점수 계산
  calculateScore() {
    switch (this.accuracy) {
      case 'perfect':
        this.score = 100;
        break;
      case 'good':
        this.score = 50;
        break;
      case 'bad':
        this.score = 10;
        break;
      case 'miss':
        this.score = 0;
        break;
      default:
        this.score = 0;
    }
  }

  // 정확도 판정
  judgeAccuracy(hitTime) {
    if (!this.expectedHitTime) return 'miss';
    const timeDiff = Math.abs(hitTime - this.expectedHitTime);
    if (timeDiff <= 0.18) return 'perfect';
    if (timeDiff <= 0.35) return 'good';
    if (timeDiff <= 0.5) return 'bad';
    return 'miss';
  }

  // 블럭이 화면에서 벗어났는지 확인
  isOffScreen() {
    return this.visualObject && !this.visualObject.active;
  }

  // 블럭이 히트 라인에 도달했는지 확인
  isAtHitLine(hitLineX) {
    if (!this.visualObject) return false;
    return Math.abs(this.visualObject.x - hitLineX) < 10;
  }

  // 블럭 정보를 문자열로 반환 (디버깅용)
  toString() {
    return `NoteBlock { note: ${this.note}, timing: ${this.timing}, lane: ${this.lane}, key: ${this.key}, bar: ${this.bar}, isHit: ${this.isHit} }`;
  }

  // 블럭 데이터를 JSON으로 직렬화
  toJSON() {
    return {
      id: this.id,
      note: this.note,
      timing: this.timing,
      duration: this.duration,
      lane: this.lane,
      key: this.key,
      bar: this.bar,
      beat: this.beat,
      accuracy: this.accuracy,
      isHit: this.isHit,
      hitTime: this.hitTime,
      expectedHitTime: this.expectedHitTime,
      score: this.score,
      combo: this.combo,
      createdAt: this.createdAt
    };
  }

  // 블럭 복사
  clone() {
    return new NoteBlock({
      note: this.note,
      timing: this.timing,
      duration: this.duration,
      lane: this.lane,
      key: this.key,
      bar: this.bar,
      beat: this.beat,
      accuracy: this.accuracy,
      isHit: this.isHit,
      hitTime: this.hitTime,
      expectedHitTime: this.expectedHitTime,
      score: this.score,
      combo: this.combo
    });
  }



  // 끝 판정을 계산하는 메서드 (끝지점이 기준선에 닿을 때 호출)
  calculateEndAccuracy(currentTime) {
    if (this.blockType !== 'hold' || !this.expectedHitTime) return null;
    
    const expectedEndTime = this.expectedHitTime + this.duration;
    const endTimeDiff = Math.abs(currentTime - expectedEndTime);
    
    let endAccuracy;
    if (currentTime < expectedEndTime - 0.2) {
      // 너무 일찍 뗌
      endAccuracy = 'miss';
    } else if (currentTime < expectedEndTime - 0.1) {
      // 일찍 뗌
      endAccuracy = 'bad';
    } else if (currentTime > expectedEndTime + 0.2) {
      // 너무 늦게 뗌
      endAccuracy = 'bad';
    } else if (currentTime > expectedEndTime + 0.1) {
      // 늦게 뗌
      endAccuracy = 'good';
    } else {
      // 정확한 타이밍
      endAccuracy = 'perfect';
    }
    
    this.endAccuracy = endAccuracy;
    return endAccuracy;
  }
} 