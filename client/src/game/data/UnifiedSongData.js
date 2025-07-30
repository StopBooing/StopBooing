/**
 * 통합 악보 패턴 데이터
 * 세션별로 다른 노트 패턴을 제공
 */
export default class UnifiedSongData {
  // 고정 레인 키 매핑 (8키)
  static getLaneKeys() {
    return { 
      1: 'a', 2: 's', 3: 'd', 4: 'f',
      5: 'j', 6: 'k', 7: 'l', 8: ';'
    };
  }

  // 세션별 곡 데이터 생성
  static createSongData(sessionType, songId) {
    switch (songId) {
      case 'song1':
        return this.createSong1Data(sessionType);
      case 'song2':
        return this.createSong2Data(sessionType);
      default:
        return this.createDefaultData(sessionType);
    }
  }

  // 곡 1 데이터 (기본 패턴)
  static createSong1Data(sessionType) {
    const noteBlocks = [];
    const laneKeys = this.getLaneKeys();
    
    // 세션별 패턴 정의
    const patterns = {
      'piano': [
        // 마디 1-4: 8키 기본 패턴
        { time: 1, lane: 1, duration: 1, beat: 1 },
        { time: 1.5, lane: 2, duration: 1, beat: 1.5 },
        { time: 2, lane: 3, duration: 1, beat: 2 },
        { time: 2.5, lane: 4, duration: 1, beat: 2.5 },
        { time: 3, lane: 5, duration: 1, beat: 3 },
        { time: 3.5, lane: 6, duration: 1, beat: 3.5 },
        { time: 4, lane: 7, duration: 1, beat: 4 },
        { time: 4.5, lane: 8, duration: 1, beat: 4.5 },
        
        // 마디 2
        { time: 5, lane: 1, duration: 1, beat: 5 },
        { time: 5.5, lane: 2, duration: 1, beat: 5.5 },
        { time: 6, lane: 3, duration: 1, beat: 6 },
        { time: 6.5, lane: 4, duration: 1, beat: 6.5 },
        { time: 7, lane: 5, duration: 1, beat: 7 },
        { time: 7.5, lane: 6, duration: 1, beat: 7.5 },
        { time: 8, lane: 7, duration: 1, beat: 8 },
        { time: 8.5, lane: 8, duration: 1, beat: 8.5 },
        
        // 마디 3
        { time: 9, lane: 1, duration: 1, beat: 9 },
        { time: 9.5, lane: 2, duration: 1, beat: 9.5 },
        { time: 10, lane: 3, duration: 1, beat: 10 },
        { time: 10.5, lane: 4, duration: 1, beat: 10.5 },
        { time: 11, lane: 5, duration: 1, beat: 11 },
        { time: 11.5, lane: 6, duration: 1, beat: 11.5 },
        { time: 12, lane: 7, duration: 1, beat: 12 },
        { time: 12.5, lane: 8, duration: 1, beat: 12.5 },
        
        // 마디 4
        { time: 13, lane: 1, duration: 1, beat: 13 },
        { time: 13.5, lane: 2, duration: 1, beat: 13.5 },
        { time: 14, lane: 3, duration: 1, beat: 14 },
        { time: 14.5, lane: 4, duration: 1, beat: 14.5 },
        { time: 15, lane: 5, duration: 1, beat: 15 },
        { time: 15.5, lane: 6, duration: 1, beat: 15.5 },
        { time: 16, lane: 7, duration: 1, beat: 16 },
        { time: 16.5, lane: 8, duration: 1, beat: 16.5 }
      ],
      'guitar': [
        // 기타 스타일 패턴 (8키)
        { time: 1, lane: 1, duration: 0.5, beat: 1 },
        { time: 1.25, lane: 2, duration: 0.5, beat: 1.25 },
        { time: 1.5, lane: 3, duration: 0.5, beat: 1.5 },
        { time: 1.75, lane: 4, duration: 0.5, beat: 1.75 },
        { time: 2, lane: 5, duration: 0.5, beat: 2 },
        { time: 2.25, lane: 6, duration: 0.5, beat: 2.25 },
        { time: 2.5, lane: 7, duration: 0.5, beat: 2.5 },
        { time: 2.75, lane: 8, duration: 0.5, beat: 2.75 },
        
        { time: 3, lane: 1, duration: 0.5, beat: 3 },
        { time: 3.25, lane: 2, duration: 0.5, beat: 3.25 },
        { time: 3.5, lane: 3, duration: 0.5, beat: 3.5 },
        { time: 3.75, lane: 4, duration: 0.5, beat: 3.75 },
        { time: 4, lane: 5, duration: 0.5, beat: 4 },
        { time: 4.25, lane: 6, duration: 0.5, beat: 4.25 },
        { time: 4.5, lane: 7, duration: 0.5, beat: 4.5 },
        { time: 4.75, lane: 8, duration: 0.5, beat: 4.75 }
      ],
      'drum': [
        // 드럼 스타일 패턴 (8키)
        { time: 1, lane: 1, duration: 0.25, beat: 1 },
        { time: 1.125, lane: 2, duration: 0.25, beat: 1.125 },
        { time: 1.25, lane: 3, duration: 0.25, beat: 1.25 },
        { time: 1.375, lane: 4, duration: 0.25, beat: 1.375 },
        { time: 1.5, lane: 5, duration: 0.25, beat: 1.5 },
        { time: 1.625, lane: 6, duration: 0.25, beat: 1.625 },
        { time: 1.75, lane: 7, duration: 0.25, beat: 1.75 },
        { time: 1.875, lane: 8, duration: 0.25, beat: 1.875 },
        
        { time: 2, lane: 1, duration: 0.25, beat: 2 },
        { time: 2.125, lane: 2, duration: 0.25, beat: 2.125 },
        { time: 2.25, lane: 3, duration: 0.25, beat: 2.25 },
        { time: 2.375, lane: 4, duration: 0.25, beat: 2.375 },
        { time: 2.5, lane: 5, duration: 0.25, beat: 2.5 },
        { time: 2.625, lane: 6, duration: 0.25, beat: 2.625 },
        { time: 2.75, lane: 7, duration: 0.25, beat: 2.75 },
        { time: 2.875, lane: 8, duration: 0.25, beat: 2.875 }
      ],
      'vocal': [
        // 보컬 스타일 패턴 (8키)
        { time: 1, lane: 1, duration: 2, beat: 1 },
        { time: 2, lane: 2, duration: 2, beat: 2 },
        { time: 3, lane: 3, duration: 2, beat: 3 },
        { time: 4, lane: 4, duration: 2, beat: 4 },
        { time: 5, lane: 5, duration: 2, beat: 5 },
        { time: 6, lane: 6, duration: 2, beat: 6 },
        { time: 7, lane: 7, duration: 2, beat: 7 },
        { time: 8, lane: 8, duration: 2, beat: 8 }
      ]
    };

    const pattern = patterns[sessionType] || patterns['piano'];
    
    pattern.forEach(p => {
      noteBlocks.push({
        timing: p.time,
        lane: p.lane,
        key: laneKeys[p.lane],
        duration: p.duration,
        blockType: p.duration > 0.5 ? 'hold' : 'tap'
      });
    });

    return noteBlocks;
  }

  // 곡 2 데이터 (고급 패턴)
  static createSong2Data(sessionType) {
    const noteBlocks = [];
    const laneKeys = this.getLaneKeys();
    
    // 세션별 고급 패턴 정의
    const patterns = {
      'piano': [
        // 복잡한 피아노 패턴
        { time: 1, lane: 1, duration: 0.5, beat: 1 },
        { time: 1.5, lane: 2, duration: 0.5, beat: 1.5 },
        { time: 2, lane: 3, duration: 1, beat: 2 },
        { time: 3, lane: 4, duration: 0.5, beat: 3 },
        { time: 3.5, lane: 1, duration: 0.5, beat: 3.5 },
        { time: 4, lane: 2, duration: 1, beat: 4 }
      ],
      'guitar': [
        // 복잡한 기타 패턴
        { time: 1, lane: 1, duration: 0.25, beat: 1 },
        { time: 1.25, lane: 2, duration: 0.25, beat: 1.25 },
        { time: 1.5, lane: 3, duration: 0.25, beat: 1.5 },
        { time: 1.75, lane: 4, duration: 0.25, beat: 1.75 },
        { time: 2, lane: 1, duration: 0.5, beat: 2 },
        { time: 2.5, lane: 2, duration: 0.5, beat: 2.5 }
      ],
      'drum': [
        // 복잡한 드럼 패턴
        { time: 1, lane: 1, duration: 0.125, beat: 1 },
        { time: 1.125, lane: 2, duration: 0.125, beat: 1.125 },
        { time: 1.25, lane: 3, duration: 0.125, beat: 1.25 },
        { time: 1.375, lane: 4, duration: 0.125, beat: 1.375 },
        { time: 1.5, lane: 1, duration: 0.25, beat: 1.5 },
        { time: 1.75, lane: 2, duration: 0.25, beat: 1.75 }
      ],
      'vocal': [
        // 복잡한 보컬 패턴
        { time: 1, lane: 1, duration: 1, beat: 1 },
        { time: 2, lane: 2, duration: 1, beat: 2 },
        { time: 3, lane: 3, duration: 1, beat: 3 },
        { time: 4, lane: 4, duration: 1, beat: 4 }
      ]
    };

    const pattern = patterns[sessionType] || patterns['piano'];
    
    pattern.forEach(p => {
      noteBlocks.push({
        timing: p.time,
        lane: p.lane,
        key: laneKeys[p.lane],
        duration: p.duration,
        blockType: p.duration > 0.5 ? 'hold' : 'tap'
      });
    });

    return noteBlocks;
  }

  // 기본 데이터
  static createDefaultData(sessionType) {
    return this.createSong1Data(sessionType);
  }
} 