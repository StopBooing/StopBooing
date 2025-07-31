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
    
    // BPM = 81 기준으로 박자 계산 (1박자 = 0.74초)
    const beatDuration = 60 / 81; // 0.74초
    
    // 통합 패턴 정의 (모든 세션이 동일한 악보를 보지만 각자 다른 세션 타입의 노트만 칠 수 있음)
    const unifiedPattern = [
      // 마디 1: 키보드 + 기타 + 드럼 + 보컬 순서로 배치
      { time: 1 * beatDuration, lane: 1, sessionType: 'keyboard' },  // 0.74초 (1박자)
      { time: 2 * beatDuration, lane: 1, sessionType: 'keyboard' },  // 1.48초 (2박자)
      { time: 3 * beatDuration, lane: 1, sessionType: 'keyboard' },      // 2.22초 (3박자)
      { time: 4 * beatDuration, lane: 1, sessionType: 'keyboard' },      // 2.96초 (4박자)
      { time: 5 * beatDuration, lane: 4, sessionType: 'keyboard' },      // 3.70초 (5박자)
      { time: 6 * beatDuration, lane: 4, sessionType: 'keyboard' },  // 4.44초 (6박자)
      { time: 7 * beatDuration, lane: 4, sessionType: 'keyboard' },  // 5.18초 (7박자)
      { time: 8 * beatDuration, lane: 4, sessionType: 'keyboard' },  // 5.92초 (8박자)
      { time: 9 * beatDuration, lane: 2, sessionType: 'keyboard' },  // 6.66초 (9박자)
      { time: 10 * beatDuration, lane: 2, sessionType: 'keyboard' }, // 7.40초 (10박자)
      { time: 11 * beatDuration, lane: 2, sessionType: 'keyboard' }, // 8.14초 (11박자)
      { time: 12 * beatDuration, lane: 2, sessionType: 'keyboard' }, // 8.88초 (12박자)
      { time: 13 * beatDuration, lane: 3, sessionType: 'keyboard' }, // 9.62초 (13박자)
      { time: 14 * beatDuration, lane: 3, sessionType: 'keyboard' }, // 10.36초 (14박자)
      { time: 15 * beatDuration, lane: 3, sessionType: 'keyboard' }, // 11.10초 (15박자)
      { time: 16 * beatDuration, lane: 3, sessionType: 'keyboard' }, // 11.84초 (16박자)
      //위까지가 딴딴딴딴 끝
      // 마디 2
      { time: 17.5 * beatDuration, lane: 8, sessionType: 'keyboard' }, // 12.58초 (17박자)
      { time: 18 * beatDuration, lane: 7, sessionType: 'keyboard' }, // 13.32초 (18박자)
      { time: 18.5 * beatDuration, lane: 6, sessionType: 'keyboard' }, // 14.06초 (19박자)
      { time: 20 * beatDuration, lane: 4, sessionType: 'keyboard' }, // 14.80초 (20박자)
      { time: 21 * beatDuration, lane: 5, sessionType: 'keyboard' }, // 15.54초 (21박자)
      { time: 22 * beatDuration, lane: 6, sessionType: 'keyboard' }, // 16.28초 (22박자)
      { time: 23 * beatDuration, lane: 7, sessionType: 'keyboard' }, // 17.02초 (23박자)
      
      // 마디 2
  
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
    
    // BPM = 81 기준으로 박자 계산 (1박자 = 0.74초)
    const beatDuration = 60 / 81; // 0.74초
    
    // 곡 2 통합 패턴
    const unifiedPattern = [
      // 마디 1: 더 복잡한 패턴
      { time: 1 * beatDuration, lane: 1, sessionType: 'drum' },
      { time: 1.25 * beatDuration, lane: 2, sessionType: 'drum' },
      { time: 1.5 * beatDuration, lane: 3, sessionType: 'keyboard' },
      { time: 1.75 * beatDuration, lane: 4, sessionType: 'drum' },
      { time: 2 * beatDuration, lane: 5, sessionType: 'guitar' },
      { time: 2.25 * beatDuration, lane: 6, sessionType: 'drum' },
      { time: 2.5 * beatDuration, lane: 7, sessionType: 'vocal' },
      { time: 2.75 * beatDuration, lane: 8, sessionType: 'drum' },
      
      // 마디 2
      { time: 3 * beatDuration, lane: 1, sessionType: 'keyboard' },
      { time: 3.25 * beatDuration, lane: 2, sessionType: 'drum' },
      { time: 3.5 * beatDuration, lane: 3, sessionType: 'guitar' },
      { time: 3.75 * beatDuration, lane: 4, sessionType: 'drum' },
      { time: 4 * beatDuration, lane: 5, sessionType: 'drum' },
      { time: 4.25 * beatDuration, lane: 6, sessionType: 'drum' },
      { time: 4.5 * beatDuration, lane: 7, sessionType: 'keyboard' },
      { time: 4.75 * beatDuration, lane: 8, sessionType: 'drum' },
      
      // 마디 3
      { time: 5 * beatDuration, lane: 1, sessionType: 'vocal' },
      { time: 5.5 * beatDuration, lane: 2, sessionType: 'guitar' },
      { time: 6 * beatDuration, lane: 3, sessionType: 'drum' },
      { time: 6.25 * beatDuration, lane: 4, sessionType: 'drum' },
      { time: 6.5 * beatDuration, lane: 5, sessionType: 'keyboard' },
      { time: 6.75 * beatDuration, lane: 6, sessionType: 'drum' },
      { time: 7 * beatDuration, lane: 7, sessionType: 'guitar' },
      { time: 7.25 * beatDuration, lane: 8, sessionType: 'drum' },
      
      // 마디 4
      { time: 7.5 * beatDuration, lane: 1, sessionType: 'drum' },
      { time: 7.75 * beatDuration, lane: 2, sessionType: 'drum' },
      { time: 8 * beatDuration, lane: 3, sessionType: 'keyboard' },
      { time: 8.25 * beatDuration, lane: 4, sessionType: 'drum' },
      { time: 8.5 * beatDuration, lane: 5, sessionType: 'guitar' },
      { time: 8.75 * beatDuration, lane: 6, sessionType: 'drum' },
      { time: 9 * beatDuration, lane: 7, sessionType: 'vocal' },
      { time: 9.25 * beatDuration, lane: 8, sessionType: 'drum' }
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