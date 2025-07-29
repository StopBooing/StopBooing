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
    
    // 모든 음의 타이밍을 배열로 정의
    const allNotes = [];
    
    // 마디 1-4: 다양한 duration 패턴 (탭과 홀드 블럭 테스트)
    const testPattern = [
      // 마디 1
      { time: 1, notes: ['C4', 'E4', 'G4'], lane: 1, duration: 1, beat: 1 },
      { time: 2, notes: ['C4', 'E4', 'G4'], lane: 2, duration: 1, beat: 2 },
      { time: 3, notes: ['C4', 'E4', 'G4'], lane: 3, duration: 1, beat: 3 },
      { time: 4, notes: ['C4', 'E4', 'G4'], lane: 4, duration: 1, beat: 4 },
      
      // 마디 2
      { time: 5, notes: ['C4', 'F4', 'A4'], lane: 1, duration: 1, beat: 1 },
      { time: 6, notes: ['C4', 'F4', 'A4'], lane: 2, duration: 1, beat: 2 },
      { time: 7, notes: ['C4', 'F4', 'A4'], lane: 3, duration: 1, beat: 3 },
      { time: 8, notes: ['C4', 'F4', 'A4'], lane: 4, duration: 1, beat: 4 },
      
      // 마디 3
      { time: 9, notes: ['C4', 'E4', 'G4'], lane: 1, duration: 1, beat: 1 },
      { time: 10, notes: ['C4', 'E4', 'G4'], lane: 2, duration: 1, beat: 2 },
      { time: 11, notes: ['C4', 'E4', 'G4'], lane: 3, duration: 1, beat: 3 },
      { time: 12, notes: ['C4', 'E4', 'G4'], lane: 4, duration: 1, beat: 4 },
      
      // 마디 4
      { time: 13, notes: ['C4', 'F4', 'A4'], lane: 1, duration: 1, beat: 1 },
      { time: 14, notes: ['C4', 'F4', 'A4'], lane: 2, duration: 1, beat: 2 },
      { time: 15, notes: ['C4', 'F4', 'A4'], lane: 3, duration: 1, beat: 3 },
      { time: 16, notes: ['C4', 'F4', 'A4'], lane: 4, duration: 1, beat: 4 }
    ];
    
    testPattern.forEach(pattern => {
      allNotes.push({
        note: pattern.notes.join(','),
        timing: pattern.time,
        lane: pattern.lane,
        key: laneKeys[pattern.lane],
        bar: Math.floor((pattern.time - 1) / 4) + 1,
        beat: pattern.beat,
        duration: pattern.duration
      });
    });
    
    // 마디 5-8
    const complexPattern = [
      // 마디 5
      { time: 17, notes: ['G4','C5','E5'], duration: 0.25, lane: 3, beat: 1 }, //미
      { time: 17.25, notes: ['D5'], duration: 0.5, lane: 2, beat: 1.25 }, //레
      { time: 17.75, notes: ['D5'], duration: 0.75, lane: 2, beat: 1.75 }, //레
      { time: 18.5, notes: ['C5'], duration: 0.25, lane: 1, beat: 2.5 }, //도
      { time: 18.75, notes: ['D5'], duration: 0.5, lane: 2, beat: 2.75 }, //레
      { time: 19.25, notes: ['C5'], duration: 0.5, lane: 1, beat: 3.25 }, //도
      { time: 19.75, notes: ['E5'], duration: 0.5, lane: 3, beat: 3.75 }, //미 
      { time: 20.25, notes: ['D5','A4','E4'], duration: 0.75, lane: 2, beat: 4.25 }, //레
      { time: 21, notes: ['C5'], duration: 0.25, lane: 1, beat: 5 }, //도
      { time: 21.25, notes: ['A4'], duration: 0.5, lane: 4, beat: 5.25 } //라
      
      // { time: 22.25, notes: ['D5'], lane: 2, beat: 6.25 },
      // { time: 22.5, notes: ['C5'], lane: 1, beat: 6.5 },
      // { time: 22.75, notes: ['G4','C5','E5'], lane: 3, beat: 6.75 },
      // { time: 23.25, notes: ['C5'], lane: 1, beat: 7.25 },
      // { time: 23.5, notes: ['E5'], lane: 3, beat: 7.5 },
      // { time: 24.25, notes: ['F4','A4','D5'], lane: 2, beat: 8.25 },
      // { time: 25, notes: ['C5'], lane: 1, beat: 9 },
      // { time: 25.25, notes: ['A4'], lane: 4, beat: 9.25 },
      // { time: 27.5, notes: ['A4'], lane: 4, beat: 11.5 },
      // { time: 27.75, notes: ['C5'], lane: 1, beat: 11.75 },
      // { time: 28, notes: ['A4'], lane: 4, beat: 12 },
      // { time: 28.25, notes: ['C5'], lane: 1, beat: 12.25 },
      // { time: 28.75, notes: ['A4'], lane: 4, beat: 12.75 },
      // { time: 29, notes: ['C5'], lane: 1, beat: 13 },
      // { time: 29.5, notes: ['A4'], lane: 4, beat: 13.5 },
      // { time: 29.75, notes: ['G4'], lane: 1, beat: 13.75 },
      // { time: 31.25, notes: ['C4','E4','A4'], lane: 4, beat: 15.25 },
      // { time: 32.25, notes: ['B4','D4','G4'], lane: 1, beat: 16.25 }
    ];
    
    complexPattern.forEach(pattern => {
      allNotes.push({
        note: pattern.notes.join(','),
        timing: pattern.time,
        lane: pattern.lane,
        key: laneKeys[pattern.lane],
        bar: 5 + Math.floor((pattern.time - 17) / 4),
        beat: pattern.beat,
        duration: pattern.duration // duration 추가
      });
    });
    
    // 모든 음을 타이밍 순으로 정렬
    allNotes.sort((a, b) => a.timing - b.timing);
    
    // 각 음의 duration 설정 (명시적으로 지정된 duration 우선 사용)
    for (let i = 0; i < allNotes.length; i++) {
      const currentNote = allNotes[i];
      let duration;
      
      if (currentNote.duration) {
        // 명시적으로 지정된 duration 사용
        duration = currentNote.duration;
      } else if (i === allNotes.length - 1) {
        // 마지막 음은 기본 길이
        duration = 0.5;
      } else {
        // 다음 음과의 시간 차이를 duration으로 설정
        const nextNote = allNotes[i + 1];
        const timeDiff = nextNote.timing - currentNote.timing;
        duration = timeDiff * 0.8; // 80%로 줄임
        
        // 최소 길이 보장
        if (duration < 0.05) {
          duration = 0.3;
        }
      }
      
      noteBlocks.push(new NoteBlock({
        note: currentNote.note,
        timing: currentNote.timing,
        duration: duration,
        lane: currentNote.lane,
        key: currentNote.key,
        bar: currentNote.bar,
        beat: currentNote.beat
      }));
    }
    
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
          duration: 0.3, // 기본 길이 줄임
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