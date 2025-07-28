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
    
    // 블럭 타입 자동 계산 (duration 기반)
    this.blockType = this.calculateBlockType();
    
    // 홀드 블럭 관련 상태
    this.isHolding = false; // 홀드 중인지 여부
    this.holdStartTime = null; // 홀드 시작 시간
    this.holdEndTime = null; // 홀드 종료 시간
    this.holdProgress = 0; // 홀드 진행률 (0~1)
    
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
    if (this.blockType === 'hold' && !this.isHolding) {
      this.isHolding = true;
      this.holdStartTime = hitTime;
      this.hit(hitTime, 'good'); // 홀드 시작 시 기본 점수
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
        
        // 홀드 완료도에 따른 점수 조정
        if (this.holdProgress >= 0.8) {
          this.accuracy = 'perfect';
        } else if (this.holdProgress >= 0.5) {
          this.accuracy = 'good';
        } else {
          this.accuracy = 'bad';
        }
        this.calculateScore();
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
    
    if (timeDiff <= 0.05) return 'perfect';
    if (timeDiff <= 0.1) return 'good';
    if (timeDiff <= 0.2) return 'bad';
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
} 