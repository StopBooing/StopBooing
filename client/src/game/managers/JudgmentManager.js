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

  // 홀드 블록 끝 판정
  judgeHoldEnd(currentTime, expectedEndTime) {
    const timeDiff = Math.abs(currentTime - expectedEndTime);
    
    if (currentTime < expectedEndTime - 0.2) {
      return 'miss'; // 너무 일찍 뗌
    } else if (currentTime < expectedEndTime - 0.1) {
      return 'bad'; // 일찍 뗌
    } else if (currentTime > expectedEndTime + 0.2) {
      return 'bad'; // 너무 늦게 뗌
    } else if (currentTime > expectedEndTime + 0.1) {
      return 'good'; // 늦게 뗌
    } else {
      return 'perfect'; // 정확한 타이밍
    }
  }

  // 홀드 노트 최종 판정 (시작과 끝을 모두 고려)
  judgeHoldNote(startAccuracy, endAccuracy) {
    // 시작이 miss면 무조건 miss
    if (startAccuracy === 'miss') {
      return 'miss';
    }
    
    // 시작과 끝이 모두 perfect면 perfect
    if (startAccuracy === 'perfect' && endAccuracy === 'perfect') {
      return 'perfect';
    }
    
    // 시작이나 끝 중 하나라도 perfect이고 다른 하나가 good이면 good
    if ((startAccuracy === 'perfect' && endAccuracy === 'good') ||
        (startAccuracy === 'good' && endAccuracy === 'perfect')) {
      return 'good';
    }
    
    // 시작과 끝이 모두 good이면 good
    if (startAccuracy === 'good' && endAccuracy === 'good') {
      return 'good';
    }
    
    // 그 외의 경우 (bad, miss)는 더 낮은 등급을 반환
    const accuracyLevels = { 'perfect': 4, 'good': 3, 'bad': 2, 'miss': 1 };
    const startLevel = accuracyLevels[startAccuracy] || 1;
    const endLevel = accuracyLevels[endAccuracy] || 1;
    const finalLevel = Math.min(startLevel, endLevel);
    
    for (const [accuracy, level] of Object.entries(accuracyLevels)) {
      if (level === finalLevel) {
        return accuracy;
      }
    }
    
    return 'miss';
  }

  // 홀드 노트 판정 테스트
  testHoldJudgment() {
    const testCases = [
      { start: 'perfect', end: 'perfect', expected: 'perfect' },
      { start: 'perfect', end: 'good', expected: 'good' },
      { start: 'good', end: 'perfect', expected: 'good' },
      { start: 'good', end: 'good', expected: 'good' },
      { start: 'perfect', end: 'bad', expected: 'bad' },
      { start: 'bad', end: 'perfect', expected: 'bad' },
      { start: 'miss', end: 'perfect', expected: 'miss' },
      { start: 'perfect', end: 'miss', expected: 'miss' },
      { start: 'miss', end: 'miss', expected: 'miss' }
    ];
    
    console.log('=== Hold Note Judgment Test ===');
    testCases.forEach((testCase, index) => {
      const result = this.judgeHoldNote(testCase.start, testCase.end);
      const passed = result === testCase.expected;
      console.log(`Test ${index + 1}: ${testCase.start} + ${testCase.end} = ${result} (${passed ? 'PASS' : 'FAIL'})`);
    });
    console.log('=== Test Complete ===');
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