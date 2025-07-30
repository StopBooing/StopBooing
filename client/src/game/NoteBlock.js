export default class NoteBlock {
  constructor(data) {
    // 기본 속성
    this.timing = data.timing;
    this.lane = data.lane;
    this.key = data.key;
    this.blockType = 'tap'; // 항상 탭 노트
    this.sessionType = data.sessionType || 'piano'; // 세션 타입 추가
    
    // 시각적 속성
    this.visualObject = null;
    this.blockHeight = 0;
    
    // 상태 속성
    this.isHit = false;
    this.hitTime = null;
    this.accuracy = null;
    this.isCompleted = false;
    
    // 타이밍 속성 (시각적 업데이트용)
    this.expectedHitTime = this.timing;
  }
  
  // 노트 히트 처리
  hit(hitTime) {
    this.isHit = true;
    this.hitTime = hitTime;
    this.accuracy = this.calculateAccuracy(hitTime);
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
    
    // 노트가 히트 라인을 완전히 지나간 후에만 파괴
    // 더 관대한 조건으로 변경하여 노트가 갑자기 사라지는 것을 방지
    return timeToEndHit < -0.5;
  }
  
  // 노트 위치 계산
  calculatePosition(currentTime, spawnY, hitLineY, previewTimeSec) {
    const timeToHitStart = this.timing - currentTime;
    const totalTravelTime = previewTimeSec;
    
    // progress를 0~1 범위로 제한하여 노트가 스폰 위치를 벗어나지 않도록 함
    let progress = 1 - (timeToHitStart / totalTravelTime);
    progress = Math.max(0, Math.min(1, progress));
    
    return spawnY + (hitLineY - spawnY) * progress;
  }
  

  
  // 디버깅용 문자열
  toString() {
    return `NoteBlock(lane=${this.lane}, key=${this.key}, timing=${this.timing})`;
  }
} 