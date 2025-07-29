// 게임 설정 상수들
export const GAME_CONFIG = {
  // 화면 설정
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // 노트 관련 설정
  PREVIEW_TIME_SEC: 2, // 노트가 화면을 이동하는 시간
  HIT_LINE_OFFSET: 150, // 기준선이 화면 아래에서 떨어진 거리
  
  // 판정 윈도우 (초 단위)
  JUDGMENT_WINDOWS: {
    PERFECT: 0.18,
    GOOD: 0.35,
    BAD: 0.5,
    MISS: 0.5
  },
  
  // 홀드 블록 관련
  HOLD: {
    MIN_HOLD_RATIO: 0.5, // 최소 홀드 시간 (duration의 50%)
    TAP_HOLD_MAX_TIME: 0.3, // 탭 블록 최대 홀드 시간
    TAP_HOLD_WARNING_TIME: 0.2 // 탭 블록 홀드 경고 시간
  },
  
  // 점수 설정
  SCORE: {
    PERFECT: 100,
    GOOD: 50,
    BAD: 10,
    MISS: 0
  },
  
  // 콤보 설정
  COMBO: {
    PERFECT: 1,
    GOOD: 1,
    BAD: 0,
    MISS: -1
  }
};

// 판정 색상
export const JUDGMENT_COLORS = {
  PERFECT: '#00ff00',
  GOOD: '#ffff00', 
  BAD: '#ff8800',
  MISS: '#ff0000'
};

// 노트 색상
export const NOTE_COLORS = {
  TAP: {
    DEFAULT: 0x0088ff,
    HIT: 0x00ff00,
    HOLD_OVER: 0xff0000,
    WARNING: 0xffff00
  },
  HOLD: {
    DEFAULT: 0x0088ff,
    HOLDING: 0xff8800,
    START: 0x00ccff,
    END: 0x00aaff
  }
};

// 레인 키 매핑
export const LANE_KEYS = {
  1: '3',
  2: 'e',
  3: 'k', 
  4: 'm'
};

// 애니메이션 설정
export const ANIMATION_CONFIG = {
  ACCURACY_TEXT: {
    DURATION: 1000,
    MOVE_DISTANCE: 50,
    FONT_SIZE: '24px',
    STROKE_THICKNESS: 3
  },
  RIPPLE: {
    DURATION: 300,
    SCALE: 1.5
  }
}; 