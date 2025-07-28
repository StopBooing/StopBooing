import NoteBlock from '../../NoteBlock.js';

export default class Bass {
  static getLaneKeys() {
    return {
      1: '3',  // 1번 레인 -> 3키
      2: 'e',  // 2번 레인 -> e키
      3: 'k',  // 3번 레인 -> k키
      4: 'm'   // 4번 레인 -> m키
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
    
    // 베이스 라인 패턴 (4마디)
    for (let bar = 1; bar <= 4; bar++) {
      const patterns = [
        { time: (bar - 1) * 4 + 1, notes: ['C2'], lane: 1 },
        { time: (bar - 1) * 4 + 2, notes: ['C2'], lane: 1 },
        { time: (bar - 1) * 4 + 3, notes: ['F2'], lane: 2 },
        { time: (bar - 1) * 4 + 4, notes: ['G2'], lane: 3 }
      ];
      
      patterns.forEach(pattern => {
        noteBlocks.push(new NoteBlock({
          note: pattern.notes.join(','),
          timing: pattern.time,
          duration: 0.5,
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
    // 곡 2의 베이스 데이터
    const noteBlocks = [];
    const laneKeys = this.getLaneKeys();
    
    // 워킹 베이스 패턴 예시
    for (let bar = 1; bar <= 8; bar++) {
      const patterns = [
        { time: (bar - 1) * 4 + 1, notes: ['E2'], lane: 1 },
        { time: (bar - 1) * 4 + 1.5, notes: ['F#2'], lane: 2 },
        { time: (bar - 1) * 4 + 2, notes: ['G2'], lane: 3 },
        { time: (bar - 1) * 4 + 2.5, notes: ['A2'], lane: 4 },
        { time: (bar - 1) * 4 + 3, notes: ['B2'], lane: 1 },
        { time: (bar - 1) * 4 + 3.5, notes: ['C3'], lane: 2 },
        { time: (bar - 1) * 4 + 4, notes: ['D3'], lane: 3 },
        { time: (bar - 1) * 4 + 4.5, notes: ['E3'], lane: 4 }
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