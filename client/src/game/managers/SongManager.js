import UnifiedSongData from '../data/UnifiedSongData.js';

export default class SongManager {
  constructor() {
    // 악기 이름 매핑
    this.instrumentMapping = {
      keyboard: 'keyboard',
      guitar: 'guitar',
      drum: 'drum',
      vocal: 'vocal'
    };
    
    this.availableSongs = ['song1', 'song2'];
    this.currentSong = 'song1';
  }

  // 세션별 곡 데이터 가져오기
  getSongData(instrumentName, songId = null) {
    const song = songId || this.currentSong;
    const sessionType = this.instrumentMapping[instrumentName] || 'keyboard';
    
    return UnifiedSongData.createSongData(sessionType, song);
  }

  // 고정 레인 키 매핑 가져오기
  getLaneKeys(instrumentName) {
    return UnifiedSongData.getLaneKeys();
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
    return Object.keys(this.instrumentMapping);
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