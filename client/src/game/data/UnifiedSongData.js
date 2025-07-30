/**
 * 통합 악보 패턴 데이터
 * 모든 세션이 동일한 악보를 공유하지만 각자 자신의 세션 타입 노트만 칠 수 있음
 */
export default class UnifiedSongData {
  // 고정 레인 키 매핑 (8키)
  static getLaneKeys() {
    return { 
      1: 'a', 2: 's', 3: 'd', 4: 'f',
      5: 'j', 6: 'k', 7: 'l', 8: ';'
    };
  }

  // 통합 곡 데이터 생성 (모든 세션이 동일한 악보 공유)
  static createSongData(sessionType, songId) {
    switch (songId) {
      case 'song1':
        return this.createSong1Data();
      case 'song2':
        return this.createSong2Data();
      default:
        return this.createDefaultData();
    }
  }

  // 곡 1 데이터 (통합 패턴 - 모든 세션이 동일한 악보 공유)
  static createSong1Data() {
    const noteBlocks = [];
    const laneKeys = this.getLaneKeys();
    
    // 통합 패턴 정의 (모든 세션이 동일한 악보를 보지만 각자 다른 세션 타입의 노트만 칠 수 있음)
    const unifiedPattern = [
      // 마디 1: 키보드 + 기타 + 드럼 + 보컬 순서로 배치
      { time: 1, lane: 1, sessionType: 'keyboard' },
      { time: 1.5, lane: 2, sessionType: 'guitar' },
      { time: 2, lane: 3, sessionType: 'drum' },
      { time: 2.5, lane: 4, sessionType: 'vocal' },
      { time: 3, lane: 5, sessionType: 'keyboard' },
      { time: 3.5, lane: 6, sessionType: 'guitar' },
      { time: 4, lane: 7, sessionType: 'drum' },
      { time: 4.5, lane: 8, sessionType: 'vocal' },
      
      // 마디 2
      { time: 5, lane: 1, sessionType: 'drum' },
      { time: 5.5, lane: 2, sessionType: 'keyboard' },
      { time: 6, lane: 3, sessionType: 'guitar' },
      { time: 6.5, lane: 4, sessionType: 'drum' },
      { time: 7, lane: 5, sessionType: 'vocal' },
      { time: 7.5, lane: 6, sessionType: 'keyboard' },
      { time: 8, lane: 7, sessionType: 'guitar' },
      { time: 8.5, lane: 8, sessionType: 'drum' },
      
      // 마디 3
      { time: 9, lane: 1, sessionType: 'vocal' },
      { time: 9.5, lane: 2, sessionType: 'drum' },
      { time: 10, lane: 3, sessionType: 'keyboard' },
      { time: 10.5, lane: 4, sessionType: 'guitar' },
      { time: 11, lane: 5, sessionType: 'drum' },
      { time: 11.5, lane: 6, sessionType: 'vocal' },
      { time: 12, lane: 7, sessionType: 'keyboard' },
      { time: 12.5, lane: 8, sessionType: 'guitar' },
      
      // 마디 4
      { time: 13, lane: 1, sessionType: 'drum' },
      { time: 13.5, lane: 2, sessionType: 'vocal' },
      { time: 14, lane: 3, sessionType: 'keyboard' },
      { time: 14.5, lane: 4, sessionType: 'guitar' },
      { time: 15, lane: 5, sessionType: 'drum' },
      { time: 15.5, lane: 6, sessionType: 'keyboard' },
      { time: 16, lane: 7, sessionType: 'guitar' },
      { time: 16.5, lane: 8, sessionType: 'vocal' }
    ];
    
    unifiedPattern.forEach(p => {
      noteBlocks.push({
        timing: p.time,
        lane: p.lane,
        key: laneKeys[p.lane],
        sessionType: p.sessionType
      });
    });

    return noteBlocks;
  }

  // 곡 2 데이터 (통합 패턴)
  static createSong2Data() {
    const noteBlocks = [];
    const laneKeys = this.getLaneKeys();
    
    // 곡 2 통합 패턴
    const unifiedPattern = [
      // 마디 1: 더 복잡한 패턴
      { time: 1, lane: 1, sessionType: 'drum' },
      { time: 1.25, lane: 2, sessionType: 'drum' },
      { time: 1.5, lane: 3, sessionType: 'keyboard' },
      { time: 1.75, lane: 4, sessionType: 'drum' },
      { time: 2, lane: 5, sessionType: 'guitar' },
      { time: 2.25, lane: 6, sessionType: 'drum' },
      { time: 2.5, lane: 7, sessionType: 'vocal' },
      { time: 2.75, lane: 8, sessionType: 'drum' },
      
      // 마디 2
      { time: 3, lane: 1, sessionType: 'keyboard' },
      { time: 3.25, lane: 2, sessionType: 'drum' },
      { time: 3.5, lane: 3, sessionType: 'guitar' },
      { time: 3.75, lane: 4, sessionType: 'drum' },
      { time: 4, lane: 5, sessionType: 'drum' },
      { time: 4.25, lane: 6, sessionType: 'drum' },
      { time: 4.5, lane: 7, sessionType: 'keyboard' },
      { time: 4.75, lane: 8, sessionType: 'drum' },
      
      // 마디 3
      { time: 5, lane: 1, sessionType: 'vocal' },
      { time: 5.5, lane: 2, sessionType: 'guitar' },
      { time: 6, lane: 3, sessionType: 'drum' },
      { time: 6.25, lane: 4, sessionType: 'drum' },
      { time: 6.5, lane: 5, sessionType: 'keyboard' },
      { time: 6.75, lane: 6, sessionType: 'drum' },
      { time: 7, lane: 7, sessionType: 'guitar' },
      { time: 7.25, lane: 8, sessionType: 'drum' },
      
      // 마디 4
      { time: 7.5, lane: 1, sessionType: 'drum' },
      { time: 7.75, lane: 2, sessionType: 'drum' },
      { time: 8, lane: 3, sessionType: 'keyboard' },
      { time: 8.25, lane: 4, sessionType: 'drum' },
      { time: 8.5, lane: 5, sessionType: 'guitar' },
      { time: 8.75, lane: 6, sessionType: 'drum' },
      { time: 9, lane: 7, sessionType: 'vocal' },
      { time: 9.25, lane: 8, sessionType: 'drum' }
    ];
    
    unifiedPattern.forEach(p => {
      noteBlocks.push({
        timing: p.time,
        lane: p.lane,
        key: laneKeys[p.lane],
        sessionType: p.sessionType
      });
    });

    return noteBlocks;
  }

  // 기본 데이터 (통합 패턴)
  static createDefaultData() {
    return this.createSong1Data();
  }
} 