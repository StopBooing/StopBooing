import Piano from '../data/instruments/Piano.js';
import ElectricGuitar from '../data/instruments/ElectricGuitar.js';
import Bass from '../data/instruments/Bass.js';
import Drums from '../data/instruments/Drums.js';

export default class SongManager {
  constructor() {
    this.instruments = {
      keyboard: Piano,
      guitar: ElectricGuitar, // guitar는 ElectricGuitar 사용
      drum: Drums, // drum은 Drums 사용
      vocal: Piano, // vocal은 임시로 Piano 사용
    };
    
    this.availableSongs = ['song1', 'song2'];
    this.currentSong = 'song1';
  }

  // 악기별 곡 데이터 가져오기
  getSongData(instrumentName, songId = null) {
    const song = songId || this.currentSong;
    const instrument = this.instruments[instrumentName];
    
    if (!instrument) {
      console.error(`알 수 없는 악기: ${instrumentName}`);
      return [];
    }
    
    return instrument.createSongData(song);
  }

  // 악기별 레인 키 매핑 가져오기
  getLaneKeys(instrumentName) {
    const instrument = this.instruments[instrumentName];
    
    if (!instrument) {
      console.error(`알 수 없는 악기: ${instrumentName}`);
      return {};
    }
    
    return instrument.getLaneKeys();
  }

  // 사용 가능한 곡 목록 가져오기
  getAvailableSongs() {
    return this.availableSongs;
  }

  // 현재 곡 설정
  setCurrentSong(songId) {
    if (this.availableSongs.includes(songId)) {
      this.currentSong = songId;
      return true;
    }
    console.error(`알 수 없는 곡: ${songId}`);
    return false;
  }

  // 현재 곡 가져오기
  getCurrentSong() {
    return this.currentSong;
  }

  // 사용 가능한 악기 목록 가져오기
  getAvailableInstruments() {
    return Object.keys(this.instruments);
  }

  // 곡 정보 가져오기 (곡 이름, 길이 등)
  getSongInfo(songId) {
    const songInfos = {
      song1: {
        name: '첫 번째 곡',
        duration: 32, // 32초
        bpm: 84,
        difficulty: 'easy'
      },
      song2: {
        name: '두 번째 곡',
        duration: 32,
        bpm: 120,
        difficulty: 'medium'
      }
    };
    
    return songInfos[songId] || null;
  }
} 