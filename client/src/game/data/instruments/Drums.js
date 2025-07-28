import NoteBlock from '../../NoteBlock.js';

export default class Drums {
  static getLaneKeys() {
    return {
      1: '3',  // 1번 레인 -> 3키 (스네어)
      2: 'e',  // 2번 레인 -> e키 (하이햇)
      3: 'k',  // 3번 레인 -> k키 (킥)
      4: 'm'   // 4번 레인 -> m키 (크래시)
    };
  }

  static createSongData(songId) {
    switch (songId) {
      case 'song1':
        return this.createSong1Data();
      case 'song2':
        return this.createSong2Data();
      default:
        return this.createDefaultData();
    }
  }

  static createSong1Data() {
    const noteBlocks = [];
    const laneKeys = this.getLaneKeys();
    
    // 기본 드럼 패턴 (4마디)
    for (let bar = 1; bar <= 4; bar++) {
      const patterns = [
        // 킥 드럼 (1, 3박)
        { time: (bar - 1) * 4 + 1, notes: ['kick'], lane: 3 },
        { time: (bar - 1) * 4 + 3, notes: ['kick'], lane: 3 },
        
        // 스네어 드럼 (2, 4박)
        { time: (bar - 1) * 4 + 2, notes: ['snare'], lane: 1 },
        { time: (bar - 1) * 4 + 4, notes: ['snare'], lane: 1 },
        
        // 하이햇 (모든 박)
        { time: (bar - 1) * 4 + 1, notes: ['hihat'], lane: 2 },
        { time: (bar - 1) * 4 + 2, notes: ['hihat'], lane: 2 },
        { time: (bar - 1) * 4 + 3, notes: ['hihat'], lane: 2 },
        { time: (bar - 1) * 4 + 4, notes: ['hihat'], lane: 2 },
        
        // 크래시 (1박)
        { time: (bar - 1) * 4 + 1, notes: ['crash'], lane: 4 }
      ];
      
      patterns.forEach(pattern => {
        noteBlocks.push(new NoteBlock({
          note: pattern.notes.join(','),
          timing: pattern.time,
          duration: 0.25,
          lane: pattern.lane,
          key: laneKeys[pattern.lane],
          bar: bar,
          beat: pattern.time - (bar - 1) * 4
        }));
      });
    }
    
    return noteBlocks;
  }

  static createSong2Data() {
    // 곡 2의 드럼 데이터
    const noteBlocks = [];
    const laneKeys = this.getLaneKeys();
    
    // 복잡한 드럼 패턴 예시
    for (let bar = 1; bar <= 8; bar++) {
      const patterns = [
        // 킥 드럼
        { time: (bar - 1) * 4 + 1, notes: ['kick'], lane: 3 },
        { time: (bar - 1) * 4 + 2.5, notes: ['kick'], lane: 3 },
        { time: (bar - 1) * 4 + 4, notes: ['kick'], lane: 3 },
        
        // 스네어 드럼
        { time: (bar - 1) * 4 + 2, notes: ['snare'], lane: 1 },
        { time: (bar - 1) * 4 + 4, notes: ['snare'], lane: 1 },
        
        // 하이햇 (8비트)
        { time: (bar - 1) * 4 + 1, notes: ['hihat'], lane: 2 },
        { time: (bar - 1) * 4 + 1.5, notes: ['hihat'], lane: 2 },
        { time: (bar - 1) * 4 + 2, notes: ['hihat'], lane: 2 },
        { time: (bar - 1) * 4 + 2.5, notes: ['hihat'], lane: 2 },
        { time: (bar - 1) * 4 + 3, notes: ['hihat'], lane: 2 },
        { time: (bar - 1) * 4 + 3.5, notes: ['hihat'], lane: 2 },
        { time: (bar - 1) * 4 + 4, notes: ['hihat'], lane: 2 },
        { time: (bar - 1) * 4 + 4.5, notes: ['hihat'], lane: 2 },
        
        // 크래시 (1박)
        { time: (bar - 1) * 4 + 1, notes: ['crash'], lane: 4 }
      ];
      
      patterns.forEach(pattern => {
        noteBlocks.push(new NoteBlock({
          note: pattern.notes.join(','),
          timing: pattern.time,
          duration: 0.25,
          lane: pattern.lane,
          key: laneKeys[pattern.lane],
          bar: bar,
          beat: pattern.time - (bar - 1) * 4
        }));
      });
    }
    
    return noteBlocks;
  }

  static createDefaultData() {
    return [];
  }
} 