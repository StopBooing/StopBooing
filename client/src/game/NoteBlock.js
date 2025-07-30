export default class NoteBlock {
  constructor(data) {
    // 기본 속성
    this.timing = data.timing;
    this.lane = data.lane;
    this.key = data.key;
    this.duration = data.duration || 0;
    this.blockType = data.blockType || 'tap';
    this.sessionType = data.sessionType || 'piano'; // 세션 타입 추가
    
    // 시각적 속성
    this.visualObject = null;
    this.blockHeight = 0;
    
    // 상태 속성
    this.isHit = false;
    this.hitTime = null;
    this.accuracy = null;
    this.isCompleted = false;
    
    // 홀드 노트 전용 속성 (제거 예정)
    this.isHolding = false;
    this.holdStartTime = null;
    this.holdEndTime = null;
    this.startAccuracy = null;
    this.endAccuracy = null;
    this.startAccuracyShown = false;
    this.endAccuracyShown = false;
    this.holdProgress = 0;
    
    // 탭 홀드 오버 속성 (제거 예정)
    this.isTapHoldOver = false;
    this.tapHoldStartTime = null;
    this.maxTapHoldTime = 0.5;
    
    // 타이밍 속성 (시각적 업데이트용)
    this.expectedHitTime = this.timing;
  }
  
  // 노트 히트 처리
  hit(hitTime) {
    this.isHit = true;
    this.hitTime = hitTime;
    this.accuracy = this.calculateAccuracy(hitTime);
  }
  
  // 홀드 시작
  startHold(startTime) {
    this.isHolding = true;
    this.holdStartTime = startTime;
    this.startAccuracy = this.calculateAccuracy(startTime);
  }
  
  // 홀드 종료
  endHold(endTime) {
    this.isHolding = false;
    this.holdEndTime = endTime;
    this.endAccuracy = this.calculateAccuracy(endTime);
    this.isCompleted = true;
  }
  
  // 홀드 조기 해제
  releaseHoldEarly(currentTime) {
    this.isHolding = false;
    this.holdEndTime = currentTime;
    this.accuracy = 'miss';
    this.isCompleted = true;
  }
  
  // 정확도 계산
  calculateAccuracy(hitTime) {
    const timeDiff = Math.abs(hitTime - this.timing);
    if (timeDiff <= 0.18) return 'perfect';
    if (timeDiff <= 0.35) return 'good';
    if (timeDiff <= 0.5) return 'bad';
    return 'miss';
  }
  
  // 노트가 파괴되어야 하는지 확인
  shouldDestroy(currentTime, noteSpeed, previewTimeSec) {
    const timeToHitStart = this.timing - currentTime;
    const timeToEndHit = timeToHitStart - (this.blockHeight / noteSpeed);
    return timeToEndHit < -0.1;
  }
  
  // 노트 위치 계산
  calculatePosition(currentTime, spawnY, hitLineY, previewTimeSec) {
    const timeToHitStart = this.timing - currentTime;
    const totalTravelTime = previewTimeSec;
    const progress = 1 - (timeToHitStart / totalTravelTime);
    return spawnY + (hitLineY - spawnY) * progress;
  }
  
  // 홀드 진행률 업데이트
  updateHoldProgress(currentTime) {
    if (this.blockType === 'hold' && this.isHolding) {
      const holdDuration = currentTime - this.holdStartTime;
      this.holdProgress = Math.min(holdDuration / this.duration, 1);
    }
  }
  
  // 탭 홀드 오버 체크
  checkTapHoldOver(currentTime) {
    if (this.blockType === 'tap' && this.isHit && !this.isTapHoldOver) {
      const holdTime = currentTime - this.hitTime;
      if (holdTime > 0.3) { // 0.3초 이상 누르면 홀드 오버
        this.isTapHoldOver = true;
        this.accuracy = 'miss';
        return true;
      }
    }
    return false;
  }
  
  // 디버깅용 문자열
  toString() {
    return `NoteBlock(lane=${this.lane}, key=${this.key}, timing=${this.timing}, type=${this.blockType})`;
  }
} 