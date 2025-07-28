import NoteBlock from '../../NoteBlock.js';

export default class Piano {
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
    
    // 마디 1-4: 기본 패턴
    for (let bar = 1; bar <= 4; bar++) {
      const lane = bar % 2 === 1 ? 1 : 2;
      const notes = bar % 2 === 1 ? ['C4', 'E4', 'G4'] : ['C4', 'F4', 'A4'];
      
      for (let beat = 1; beat <= 4; beat++) {
        const timing = (bar - 1) * 4 + beat;
        noteBlocks.push(new NoteBlock({
          note: notes.join(','),
          timing: timing,
          duration: 0.5,
          lane: lane,
          key: laneKeys[lane],
          bar: bar,
          beat: beat
        }));
      }
    }
    
    // 마디 5-8: 복잡한 패턴
    const complexPattern = [
      { time: 17, notes: ['E5'], lane: 3, beat: 1 },
      { time: 17.25, notes: ['D5'], lane: 2, beat: 1.25 },
      { time: 17.75, notes: ['D5'], lane: 2, beat: 1.75 },
      { time: 18.5, notes: ['C5'], lane: 1, beat: 2.5 },
      { time: 18.75, notes: ['D5'], lane: 2, beat: 2.75 },
      { time: 19.25, notes: ['C5'], lane: 1, beat: 3.25 },
      { time: 19.75, notes: ['E5'], lane: 3, beat: 3.75 },
      { time: 20.25, notes: ['D5','A4','E4'], lane: 2, beat: 4.25 },
      { time: 21, notes: ['C5'], lane: 1, beat: 5 },
      { time: 21.25, notes: ['A4'], lane: 4, beat: 5.25 },
      { time: 22.25, notes: ['D5'], lane: 2, beat: 6.25 },
      { time: 22.5, notes: ['C5'], lane: 1, beat: 6.5 },
      { time: 22.75, notes: ['G4','C5','E5'], lane: 3, beat: 6.75 },
      { time: 23.25, notes: ['C5'], lane: 1, beat: 7.25 },
      { time: 23.5, notes: ['E5'], lane: 3, beat: 7.5 },
      { time: 24.25, notes: ['F4','A4','D5'], lane: 2, beat: 8.25 },
      { time: 25, notes: ['C5'], lane: 1, beat: 9 },
      { time: 25.25, notes: ['A4'], lane: 4, beat: 9.25 },
      { time: 27.5, notes: ['A4'], lane: 4, beat: 11.5 },
      { time: 27.75, notes: ['C5'], lane: 1, beat: 11.75 },
      { time: 28, notes: ['A4'], lane: 4, beat: 12 },
      { time: 28.25, notes: ['C5'], lane: 1, beat: 12.25 },
      { time: 28.75, notes: ['A4'], lane: 4, beat: 12.75 },
      { time: 29, notes: ['C5'], lane: 1, beat: 13 },
      { time: 29.5, notes: ['A4'], lane: 4, beat: 13.5 },
      { time: 29.75, notes: ['G4'], lane: 1, beat: 13.75 },
      { time: 31.25, notes: ['C4','E4','A4'], lane: 4, beat: 15.25 },
      { time: 32.25, notes: ['B4','D4','G4'], lane: 1, beat: 16.25 }
    ];
    
    complexPattern.forEach(pattern => {
      noteBlocks.push(new NoteBlock({
        note: pattern.notes.join(','),
        timing: pattern.time,
        duration: 0.5,
        lane: pattern.lane,
        key: laneKeys[pattern.lane],
        bar: 5 + Math.floor((pattern.time - 17) / 4),
        beat: pattern.beat
      }));
    });
    
    return noteBlocks;
  }

  static createSong2Data() {
    // 곡 2의 피아노 데이터
    const noteBlocks = [];
    const laneKeys = this.getLaneKeys();
    
    // 간단한 패턴 예시
    for (let bar = 1; bar <= 8; bar++) {
      const lane = ((bar - 1) % 4) + 1;
      const notes = ['C4', 'E4', 'G4'];
      
      for (let beat = 1; beat <= 4; beat++) {
        const timing = (bar - 1) * 4 + beat;
        noteBlocks.push(new NoteBlock({
          note: notes.join(','),
          timing: timing,
          duration: 0.5,
          lane: lane,
          key: laneKeys[lane],
          bar: bar,
          beat: beat
        }));
      }
    }
    
    return noteBlocks;
  }

  static createDefaultData() {
    // 기본 데이터 (빈 배열)
    return [];
  }
} 