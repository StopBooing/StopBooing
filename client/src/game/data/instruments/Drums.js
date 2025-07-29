import NoteBlock from '../../NoteBlock.js';

export default class Drums {
  static getLaneKeys() {
    return {
      1: 'a',
      2: 's',
      3: 'k',
      4: 'l'
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

  // 드럼 노트를 음표 이름으로 매핑
  static getDrumNoteMapping() {
    return {
      'kick': 'C2',    // 킥 드럼 → C2
      'snare': 'D2',   // 스네어 드럼 → D2
      'hihat': 'E2',   // 하이햇 → E2
      'hihat_closed' : 'E3',
      'crash': 'F2',   // 크래시 심벌 → F2
      'tom1': 'G2',    // 톰1 → G2
      'tom2': 'A2',    // 톰2 → A2
      'tom3': 'B2',    // 톰3 → B2
      'ride': 'C3'     // 라이드 심벌 → C3
    };
  }

  static createSong1Data() {
    const noteBlocks = [];
    const laneKeys = this.getLaneKeys();
    const drumMapping = this.getDrumNoteMapping();
    
    const patterns = [
      // { time: 1, notes: ['hihat_closed'], lane: 1, duration: 1 },
      // { time: 2, notes: ['hihat_closed'], lane: 2, duration: 1 },
      // { time: 3, notes: ['tom1'], lane: 3, duration: 0.5 },
      // { time: 3.5, notes: ['snare'], lane: 2, duration: 0.5 },
      // { time: 4, notes: ['snare'], lane: 1, duration: 0.25 },
      // { time: 4.25, notes: ['tom1'], lane: 4, duration: 0.25 },
      // { time: 4.5, notes: ['tom2'], lane: 3, duration: 0.5 },

      //2마디
      { time: 5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 5, notes: ['kick'], lane: 4, duration: 0.5 },
      { time: 5.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 6, notes: ['snare'], lane: 1, duration: 0.5 },
      { time: 6, notes: ['hihat_closed'], lane: 2, duration: 0.5 },
      { time: 6.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 7, notes: ['kick'], lane: 4, duration: 0.5 },
      { time: 7, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 7.5, notes: ['kick'], lane: 4, duration: 0.5 },
      { time: 7.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 8, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 8, notes: ['snare'], lane: 2, duration: 0.5 },
      { time: 8.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },

      //3마디
      { time: 9, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 9, notes: ['kick'], lane: 4, duration: 0.5 },
      { time: 9.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 10, notes: ['snare'], lane: 1, duration: 0.5 },
      { time: 10, notes: ['hihat_closed'], lane: 2, duration: 0.5 },
      { time: 10.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 11, notes: ['kick'], lane: 4, duration: 0.5 },
      { time: 11, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 11.5, notes: ['kick'], lane: 4, duration: 0.5 },
      { time: 11.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 12, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 12, notes: ['snare'], lane: 2, duration: 0.5 },
      { time: 12.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },

      //4마디
      { time: 13, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 13, notes: ['kick'], lane: 4, duration: 0.5 },
      { time: 13.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 14, notes: ['snare'], lane: 1, duration: 0.5 },
      { time: 14, notes: ['hihat_closed'], lane: 2, duration: 0.5 },
      { time: 14.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 15, notes: ['kick'], lane: 4, duration: 0.5 },
      { time: 15, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 15.5, notes: ['kick'], lane: 4, duration: 0.5 },
      { time: 15.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 16, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 16, notes: ['snare'], lane: 2, duration: 0.5 },
      { time: 16.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },

      //5마디
      { time: 17, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 17, notes: ['kick'], lane: 4, duration: 0.5 },
      { time: 17.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      { time: 18, notes: ['snare'], lane: 1, duration: 0.5 },
      { time: 18, notes: ['hihat_closed'], lane: 2, duration: 0.5 },
      { time: 18.5, notes: ['hihat_closed'], lane: 1, duration: 0.5 },
      
      { time :19, notes: ['tom1'], lane: 1, duration: 0.25 },
      { time: 19.25, notes: ['snare'], lane: 2, duration: 0.25 },
      { time: 19.5, notes: ['snare'], lane: 1, duration: 0.25 },
      { time: 19.75, notes: ['snare'], lane: 2, duration: 0.25 },
      { time: 20, notes: ['snare'], lane: 3, duration: 0.25 },
      { time: 20.25, notes: ['tom1'], lane: 4, duration: 0.25 },
      { time: 20.5, notes: ['tom3'], lane: 3, duration: 0.25 },
      { time: 20.75, notes: ['tom3'], lane: 4, duration: 0.25 },

      //4마디
      // //3마디
      // { time: 8.5, notes: ['kick'], lane: 4, duration: 1 },
      // { time: 9, notes: ['hihat_closed'], lane: 1, duration: 1 },
      // { time: 9.5, notes: ['hihat_closed'], lane: 2, duration: 1 },
      // { time: 10, notes: ['tom1'], lane: 3, duration: 0.5 },
    ];  

    patterns.forEach(pattern => {
      // 드럼 노트를 음표 이름으로 변환
      const mappedNotes = pattern.notes.map(note => drumMapping[note] || note);
      
      noteBlocks.push(new NoteBlock({
        note: mappedNotes.join(','),
        timing: pattern.time,
        duration: 0.25,
        lane: pattern.lane,
        key: laneKeys[pattern.lane],
        bar: 1,
        beat: pattern.time
      }));
    });
    
    return noteBlocks;
  }

  static createSong2Data() {
    // 곡 2의 드럼 데이터
    const noteBlocks = [];
    return noteBlocks;
  }

  static createDefaultData() {
    return [];
  }
} 