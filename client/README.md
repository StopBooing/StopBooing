# 리듬 게임 클라이언트

## 🎵 프로젝트 개요
Phaser.js와 HTML5 Audio를 사용한 멀티플레이어 리듬 게임 클라이언트입니다.

## 🏗️ 아키텍처

### 핵심 컴포넌트
- **JamScene**: 메인 게임 씬 (Phaser.js)
- **NoteBlock**: 노트 블록 클래스
- **JudgmentManager**: 판정 및 점수 관리
- **SongManager**: 곡 데이터 관리
- **PerformanceMonitor**: 성능 모니터링

### 상수 및 설정
- **GameConstants**: 게임 설정 상수들
- **ErrorHandler**: 에러 처리 유틸리티

## 🎮 게임 시스템

### 판정 시스템
- **Perfect**: ±0.18초 이내
- **Good**: ±0.35초 이내  
- **Bad**: ±0.5초 이내
- **Miss**: ±0.5초 초과

### 노트 타입
- **Tap Block**: 짧은 노트 (0.75초 미만)
- **Hold Block**: 긴 노트 (0.75초 이상)

### 점수 시스템
- Perfect: 100점
- Good: 50점
- Bad: 10점
- Miss: 0점

## 🚀 최적화 사항

### 성능 개선
- ✅ 메서드 분리로 가독성 향상
- ✅ 상수 분리로 유지보수성 개선
- ✅ 에러 처리 강화
- ✅ 메모리 누수 방지 (cleanup 메서드)
- ✅ 성능 모니터링 시스템 추가

### 코드 품질
- ✅ 판정 로직 통합 (JudgmentManager)
- ✅ 타입 안정성 향상
- ✅ 하드코딩 제거
- ✅ 중복 코드 제거

## 📁 파일 구조
```
src/
├── game/
│   ├── constants/
│   │   └── GameConstants.js
│   ├── managers/
│   │   ├── JudgmentManager.js
│   │   └── SongManager.js
│   ├── JamScene.js
│   └── NoteBlock.js
├── utils/
│   ├── ErrorHandler.js
│   └── PerformanceMonitor.js
├── components/
│   └── PhaserGame.jsx
└── pages/
    └── GameContainer.jsx
```

## 🎯 주요 기능

### 판정 시스템
- 실시간 정확도 계산
- 콤보 시스템
- 시각적 피드백

### 멀티플레이어
- Socket.IO 기반 실시간 통신
- 악기별 역할 분담

### 성능 모니터링
- FPS 추적
- 메모리 사용량 모니터링
- 성능 최적화 제안

## 🔧 개발 환경
- Node.js
- Vite
- Phaser.js
- HTML5 Audio
- React

## 🚀 실행 방법
```bash
npm install
npm run dev
```

## 📊 성능 지표
- 목표 FPS: 60
- 최대 노트 수: 100개
- 메모리 사용량: 100MB 이하
- 업데이트 시간: 16ms 이하
