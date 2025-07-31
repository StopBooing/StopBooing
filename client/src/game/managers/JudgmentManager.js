import { GAME_CONFIG, JUDGMENT_COLORS } from '../constants/GameConstants.js';

export default class JudgmentManager {
  constructor() {
    this.totalHits = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.badHits = 0;
    this.missHits = 0;
    this.currentAccuracy = 100;
    this.currentCombo = 0;
    this.totalScore = 0;
  }

  // 정확도 판정
  judgeAccuracy(hitTime, expectedHitTime) {
    if (!expectedHitTime) return 'miss';
    
    const timeDiff = Math.abs(hitTime - expectedHitTime);
    const { PERFECT, GOOD, BAD } = GAME_CONFIG.JUDGMENT_WINDOWS;
    
    if (timeDiff <= PERFECT) return 'perfect';
    if (timeDiff <= GOOD) return 'good';
    if (timeDiff <= BAD) return 'bad';
    return 'miss';
  }



  // 점수 계산
  calculateScore(accuracy) {
    return GAME_CONFIG.SCORE[accuracy.toUpperCase()] || 0;
  }

  // 콤보 업데이트
  updateCombo(accuracy) {
    const comboChange = GAME_CONFIG.COMBO[accuracy.toUpperCase()] || 0;
    this.currentCombo = Math.max(0, this.currentCombo + comboChange);
    return this.currentCombo;
  }

  // 정확도 통계 업데이트
  updateAccuracyStats(accuracy) {
    this.totalHits++;
    
    switch (accuracy) {
      case 'perfect':
        this.perfectHits++;
        break;
      case 'good':
        this.goodHits++;
        break;
      case 'bad':
        this.badHits++;
        break;
      case 'miss':
        this.missHits++;
        break;
    }
    
    // 전체 정확도 계산
    this.currentAccuracy = this.totalHits > 0 
      ? Math.round((this.perfectHits + this.goodHits * 0.5) / this.totalHits * 100)
      : 100;
  }

  // 점수와 콤보 업데이트
  updateScoreAndCombo(accuracy) {
    const score = this.calculateScore(accuracy);
    this.totalScore += score;
    this.updateCombo(accuracy);
    this.updateAccuracyStats(accuracy);
    
    return {
      score,
      totalScore: this.totalScore,
      combo: this.currentCombo,
      accuracy: this.currentAccuracy
    };
  }

  // 점수만 업데이트 (콤보는 서버에서 관리)
  updateScore(accuracy) {
    const score = this.calculateScore(accuracy);
    this.totalScore += score;
    this.updateAccuracyStats(accuracy);
    
    return {
      score,
      totalScore: this.totalScore,
      accuracy: this.currentAccuracy
    };
  }

  // 판정 색상 가져오기
  getJudgmentColor(accuracy) {
    return JUDGMENT_COLORS[accuracy.toUpperCase()] || '#ffffff';
  }

  // 통계 정보 가져오기
  getStats() {
    return {
      totalHits: this.totalHits,
      perfectHits: this.perfectHits,
      goodHits: this.goodHits,
      badHits: this.badHits,
      missHits: this.missHits,
      currentAccuracy: this.currentAccuracy,
      currentCombo: this.currentCombo,
      totalScore: this.totalScore
    };
  }

  // 통계 리셋
  reset() {
    this.totalHits = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.badHits = 0;
    this.missHits = 0;
    this.currentAccuracy = 100;
    this.currentCombo = 0;
    this.totalScore = 0;
  }
} 