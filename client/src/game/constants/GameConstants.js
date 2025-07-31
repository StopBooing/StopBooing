// 게임 설정 상수들
export const GAME_CONFIG = {
  // 화면 설정
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // 키 설정
  KEY_COUNT: 8, // 8키 모드
  LANE_COUNT: 8, // 8레인
  
  // 노트 관련 설정
  PREVIEW_TIME_SEC: 2, // 노트가 화면을 이동하는 시간
  HIT_LINE_OFFSET: 150, // 기준선이 화면 아래에서 떨어진 거리
  
  // 노트 크기 설정
  NOTE: {
    WIDTH_RATIO: 0.95, // 레인 간격 대비 노트 너비 비율
    TAP_HEIGHT: 25, // 탭 노트 높이
    SPACING_MARGIN: 5 // 노트 간격 여백
  },
  
  // 판정 윈도우 (초 단위)
  JUDGMENT_WINDOWS: {
    PERFECT: 0.18,
    GOOD: 0.35,
    BAD: 0.5,
    MISS: 0.5
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

// 세션별 노트 색상
export const SESSION_COLORS = {
  keyboard: {
    TAP: 0x00cc00,    // 초록색
    HIT: 0x00ff00     // 밝은 초록색
  },
  guitar: {
    TAP: 0xff6600,    // 주황색
    HIT: 0xff8800     // 밝은 주황색
  },
  drum: {
    TAP: 0xcc00cc,    // 보라색
    HIT: 0xff66ff     // 연한 보라색
  },
  vocal: {
    TAP: 0xff0066,    // 분홍색
    HIT: 0xff99cc     // 매우 연한 분홍색
  },

};

// 노트 색상 (하위 호환성)
export const NOTE_COLORS = {
  TAP: {
    DEFAULT: 0x0088ff,
    HIT: 0x00ff00
  }
};

// 레인 키 매핑 (8키)
export const LANE_KEYS = {
  1: 'a',
  2: 's',
  3: 'd',
  4: 'f',
  5: 'j',
  6: 'k',
  7: 'l',
  8: ';'
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