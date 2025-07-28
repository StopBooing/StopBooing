import NoteBlock from '../../NoteBlock.js';

export default class ElectricGuitar {
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
    
    // 4마디 패턴
    for (let bar = 1; bar <= 4; bar++) {
      const patterns = [
        { time: (bar - 1) * 4 + 1, notes: ['C3'], lane: 1 },
        { time: (bar - 1) * 4 + 2, notes: ['E3'], lane: 2 },
        { time: (bar - 1) * 4 + 3, notes: ['F3'], lane: 3 },
        { time: (bar - 1) * 4 + 4, notes: bar === 1 || bar === 3 ? ['G3'] : ['A#3'], lane: 4 }
      ];
      
      if (bar === 2) {
        patterns[3] = { time: (bar - 1) * 4 + 4, notes: ['A#3'], lane: 4 };
      } else if (bar === 3) {
        patterns[0] = { time: (bar - 1) * 4 + 1, notes: ['E4'], lane: 1 };
        patterns[1] = { time: (bar - 1) * 4 + 2, notes: ['F#4'], lane: 2 };
      }
      
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
    // 곡 2의 일렉기타 데이터
    const noteBlocks = [];
    const laneKeys = this.getLaneKeys();
    
    // 파워코드 패턴 예시
    for (let bar = 1; bar <= 8; bar++) {
      const patterns = [
        { time: (bar - 1) * 4 + 1, notes: ['E2', 'E3'], lane: 1 },
        { time: (bar - 1) * 4 + 2, notes: ['A2', 'A3'], lane: 2 },
        { time: (bar - 1) * 4 + 3, notes: ['D3', 'D4'], lane: 3 },
        { time: (bar - 1) * 4 + 4, notes: ['G3', 'G4'], lane: 4 }
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

  static createDefaultData() {
    return [];
  }
} 