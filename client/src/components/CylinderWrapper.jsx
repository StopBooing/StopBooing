import React, { useState, useEffect, useRef } from 'react';
import { SESSION_COLORS } from '../game/constants/GameConstants.js';
import { NONE } from 'phaser';


const CylinderWrapper = ({ children, width = 200, height = 200, showBooth = false, position = {}, showStage = true, sessionType = 'keyboard', currentSession = 'keyboard' ,countdownComplete = false}) => {

  const [curtainOpen, setCurtainOpen] = useState(false);
  const [musicNotes, setMusicNotes] = useState([]);
  const [speechText1, setSpeechText1] = useState('');
  const [speechText2, setSpeechText2] = useState('');
  const [showSpeech1, setShowSpeech1] = useState(false);
  const [showSpeech2, setShowSpeech2] = useState(false);
  
  // 전역 말풍선 상태 관리
  const [globalSpeechState, setGlobalSpeechState] = useState({
    currentSession: null,
    isInitialPhase: true,
    initialPhaseComplete: false,
    nextSpeaker: null,
    nextArea: null
  });
  
  // 전역 타이머 ID 저장 (컴포넌트 간 공유를 위해)
  const globalTimerRef = useRef(null);
  
  // 정기 단계 말풍선 텍스트 배열
  const regularSpeechBubbleTexts = [
    '유후~',
    '좋았어!',
    '앗싸~',
    '야호~!',
    '화이팅!',
    '아 뭐해 ㅡㅡ',
    '재밌당 ><',
    '흠..',
    '(집중중..)'
  ];
  
  // 초기 단계 말풍선 텍스트 배열 (인사용)
  const initialSpeechBubbleTexts = [
    '인호야 잘하자', 
    '2분반 사랑해',
    '얘들아 수고했어',
    '빠이링'
  ];
  
  // 정기 단계 무작위 텍스트 선택 함수
  const getRandomRegularSpeechText = () => {
    const randomIndex = Math.floor(Math.random() * regularSpeechBubbleTexts.length);
    return regularSpeechBubbleTexts[randomIndex];
  };
  
  // 초기 단계 무작위 텍스트 선택 함수
  const getRandomInitialSpeechText = () => {
    const randomIndex = Math.floor(Math.random() * initialSpeechBubbleTexts.length);
    return initialSpeechBubbleTexts[randomIndex];
  };
  
  // 컴포넌트 마운트 시 한 번만 텍스트 설정
  useEffect(() => {
    setSpeechText1(getRandomInitialSpeechText()); // 초기 단계용 텍스트
    setSpeechText2(getRandomInitialSpeechText()); // 초기 단계용 텍스트
  }, [sessionType]); // sessionType이 변경될 때만 새로운 텍스트 생성
  
  // 세션별 초기 순서 설정
  const getInitialOrder = (sessionType) => {
    switch (sessionType) {
      case 'drum': return 0; // 첫 번째
      case 'guitar': return 1; // 두 번째
      case 'vocal': return 2; // 세 번째
      case 'piano': return 3; // 네 번째
      default: return 0;
    }
  };
  
  // 세션별 말풍선 타이밍 설정 (10초 주기)
  const getSpeechTiming = (sessionType) => {
    const baseInterval = 10000; // 10초 주기
    const sessionOrder = getInitialOrder(sessionType);
    
    // 각 세션마다 영역 1 또는 2 중 하나만 선택
    const useArea1 = Math.random() < 0.5; // 50% 확률로 영역 1 선택
    
    return {
      interval: baseInterval,
      initialDelay: sessionOrder * 2000, // 세션별로 2초씩 차이
      useArea1: useArea1, // 영역 1 사용 여부
      area1Offset: 0, // 영역1은 기본 타이밍
      area2Offset: 2500 // 영역2는 2.5초 후 시작 (영역1과 겹치지 않도록)
    };
  };
  
  // 랜덤 세션과 영역 선택 함수
  const getRandomSessionAndArea = () => {
    const sessions = ['drum', 'guitar', 'vocal', 'piano'];
    const areas = [1, 2]; // 영역 1 또는 2
    
    const randomSession = sessions[Math.floor(Math.random() * sessions.length)];
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    
    return { session: randomSession, area: randomArea };
  };
  
  // 말풍선 애니메이션 타이머 설정
  useEffect(() => {
    // 카운트다운이 완료되지 않았으면 말풍선 시작하지 않음
    if (!countdownComplete) {
      return;
    }
    
    console.log(`${sessionType} 세션 말풍선 시작`);
    const timing = getSpeechTiming(sessionType);
    
    // 초기 단계: 세션별로 순서대로 한마디씩 (선택된 영역만)
    const initialTimer = setTimeout(() => {
      if (timing.useArea1) {
        setShowSpeech1(true);
        setTimeout(() => {
          setShowSpeech1(false);
        }, 2000); // 초기 말풍선은 2초만 표시
      } else {
        setShowSpeech2(true);
        setTimeout(() => {
          setShowSpeech2(false);
        }, 2000); // 초기 말풍선은 2초만 표시
      }
    }, timing.initialDelay);
    
    // 전역 정기 타이머 시작 (한 번만 실행되도록)
    const startGlobalTimer = () => {
      if (globalTimerRef.current) return; // 이미 실행 중이면 중복 실행 방지
      
      globalTimerRef.current = setInterval(() => {
        const { session: randomSession, area: randomArea } = getRandomSessionAndArea();
        setGlobalSpeechState(prev => ({
          ...prev,
          nextSpeaker: randomSession,
          nextArea: randomArea
        }));
        
        // 2초 후 말풍선 숨김
        setTimeout(() => {
          setGlobalSpeechState(prev => ({
            ...prev,
            nextSpeaker: null,
            nextArea: null
          }));
        }, 2000);
      }, 10000); // 10초마다 랜덤 세션과 영역 선택
    };
    
    // 초기 단계 완료 후 전역 타이머 시작
    const globalTimerStart = setTimeout(() => {
      startGlobalTimer();
    }, 8000); // 모든 초기 말풍선 완료 후 시작
    
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(globalTimerStart);
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
        globalTimerRef.current = null;
      }
    };
  }, [sessionType, countdownComplete]);

  // 세션별 대표 색상 가져오기
  const sessionColor = SESSION_COLORS[sessionType]?.TAP || SESSION_COLORS.keyboard.TAP;
  const backgroundColorHex = '#' + sessionColor.toString(16).padStart(6, '0');
  
  // 현재 선택된 세션인지 확인하여 테두리 색상 결정
  const isCurrentSession = sessionType === currentSession;
  const borderColor = isCurrentSession ? backgroundColorHex : '#46464c'; // 자기 세션은 색깔, 나머지는 흰색

  // 음표 이미지 배열
  const musicImages = ['/assets/music/music1.png', '/assets/music/music2.png', '/assets/music/music3.png'];

  // 음표 생성 함수
  const createMusicNote = () => {
    const randomImage = musicImages[Math.floor(Math.random() * musicImages.length)];
    const randomDuration = 4 + Math.random() * 3; // 4-7초
    const randomDelay = Math.random() * 1.5; // 0-1.5초 지연

    // 피아노는 왼쪽에서 오른쪽으로, 나머지는 오른쪽에서 왼쪽으로
    const isPiano = sessionType === 'piano';
    const isDrum = sessionType === 'drum';
    const startX = isPiano ? -20 : 100; // 피아노는 왼쪽에서 시작, 나머지는 오른쪽에서 시작
    const endX = isPiano ? 120 : -20; // 피아노는 오른쪽으로 이동, 나머지는 왼쪽으로 이동
    const randomY = Math.random() * 30; // 세로 위치는 랜덤

    return {
      id: Date.now() + Math.random(),
      image: randomImage,
      x: startX,
      y: randomY,
      endX: endX,
      duration: randomDuration,
      delay: randomDelay,
      direction: isPiano ? 'right' : 'left',
      isDrum: isDrum
    };
  };

  // 세션별 음표 영역 설정
  const getMusicNoteArea = (sessionType) => {
    switch (sessionType) {
      case 'drum':
        return { top: 150, left: 90, width: '50%', height: '20%' };
      case 'guitar':
        return { top: 120, left: 0, width: '35%', height: '20%' };
      case 'vocal':
        return { top: 30, left: 20, width: '40%', height: '20%' };
      case 'piano':
        return { top: 40, left: 190, width: '40%', height: '25%' };
      default:
        return { top: 20, left: 65, width: '60%', height: '30%' };
    }
  };

  const musicNoteArea = getMusicNoteArea(sessionType);

  // 세션별 말풍선 영역 설정 (2개씩)
  const getSpeechBubbleAreas = (sessionType) => {
    switch (sessionType) {
      case 'drum':
        return [
          { top: 50, left: 50, width: '30%', height: '15%' },
          { top: 80, left: 200, width: '25%', height: '12%' }
        ];
      case 'guitar':
        return [
          { top: 60, left: 20, width: '28%', height: '14%' },
          { top: 90, left: 180, width: '30%', height: '15%' }
        ];
      case 'vocal':
        return [
          { top: 40, left: 60, width: '32%', height: '16%' },
          { top: 70, left: 220, width: '26%', height: '13%' }
        ];
      case 'piano':
        return [
          { top: 55, left: 40, width: '29%', height: '14%' },
          { top: 85, left: 210, width: '27%', height: '13%' }
        ];
      default:
        return [
          { top: 50, left: 50, width: '30%', height: '15%' },
          { top: 80, left: 200, width: '25%', height: '12%' }
        ];
    }
  };

  const speechBubbleAreas = getSpeechBubbleAreas(sessionType);

  // 음표 애니메이션 효과
  useEffect(() => {
    const interval = setInterval(() => {
      setMusicNotes(prev => {
        const newNotes = prev.filter(note => {
          const elapsed = (Date.now() - note.id) / 1000;
          return elapsed < note.duration + note.delay;
        });
        
        if (newNotes.length < 4) { // 최대 4개까지만 유지
          newNotes.push(createMusicNote());
        }
        
        return newNotes;
      });
    }, 1200); // 1.2초마다 새로운 음표 생성

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      overflow: 'visible' // Added for podium visibility
    }}>
      {/* 부스 배경 이미지 */}
      {showBooth && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          width: '140%', // User's latest change
          height: '100%',
          background: 'url(/assets/booth/booth_final.png)',
          backgroundSize: '100% 100%', // Changed from 'contain' to allow stretching
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
        }} />
      )}
      
      {/* 스포트라이트 빔 효과 (부모 컨테이너 밖으로) */}
      <div style={{
        position: 'absolute',
        top: '48px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '370px',
        background: `radial-gradient(farthest-corner at center top, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.1) 70%, transparent 90%)`,
        pointerEvents: 'none',
        zIndex: 15,
        filter: `drop-shadow(0 0 30px ${backgroundColorHex}60)` // 세션별 색상 글로우 효과 더 강화
      }} />
      
      {/* Stickman과 단상을 감싸는 새로운 영역 */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '400px',
        height: '350px', // Stickman + 단상 높이
        borderRadius: '8px',
        backgroundColor: backgroundColorHex, // 세션별 대표 색깔로 배경 채우기
        backgroundImage: 'url(/assets/background/curtain.png)', // 커튼 배경 추가
        backgroundSize: 'cover', // 커튼이 영역을 완전히 덮도록
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        padding: '10px',
        zIndex: 1, // 가장 낮은 우선순위
        boxShadow: `0 0 0 12px ${borderColor}, inset -6px -6px 12px rgba(0,0,0,0.4), inset 6px 6px 12px rgba(255,255,255,0.2)`, // 더 강한 입체감 효과
        overflow: 'visible' // 스포트라이트 빔이 컨테이너 밖으로 나갈 수 있도록
      }}>
        {/* 음표가 흘러나오는 영역 */}
        <div style={{
          position: 'absolute',
          top: musicNoteArea.top,
          left: musicNoteArea.left,
          width: musicNoteArea.width,
          height: musicNoteArea.height,
          pointerEvents: 'none',
          zIndex: 100,
          overflow: 'hidden',
          borderRadius: '8px'
        }}>
          {musicNotes.map((note) => (
            <div
              key={note.id}
              style={{
                position: 'absolute',
                left: `${note.x}%`,
                top: `${note.y}%`,
                width: '35px',
                height: '35px',
                backgroundImage: `url(${note.image})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                animation: note.direction === 'right' 
                  ? (note.isDrum ? `musicFloatRightLong ${note.duration}s linear ${note.delay}s infinite` : `musicFloatRight ${note.duration}s linear ${note.delay}s infinite`)
                  : (note.isDrum ? `musicFloatLeftLong ${note.duration}s linear ${note.delay}s infinite` : `musicFloatLeft ${note.duration}s linear ${note.delay}s infinite`),
                opacity: 0.8
              }}
            />
          ))}
        </div>
        
        {/* 말풍선 생성 영역 1 */}
        <div style={{
          position: 'absolute',
          top: speechBubbleAreas[0].top,
          left: speechBubbleAreas[0].left,
          width: speechBubbleAreas[0].width,
          height: speechBubbleAreas[0].height,
          pointerEvents: 'none',
          zIndex: 100,
          overflow: 'hidden',
          borderRadius: '8px',
          border: '2px dashed blue',
          backgroundImage: (showSpeech1 || (globalSpeechState.nextSpeaker === sessionType && globalSpeechState.nextArea === 1)) ? 'url(/assets/booth/talk.png)' : 'none',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: (showSpeech1 || (globalSpeechState.nextSpeaker === sessionType && globalSpeechState.nextArea === 1)) ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
                      }}>
                <span style={{
                  color: '#000000',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '5px',
                  marginBottom: '10px',
                  textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                  opacity: (showSpeech1 || (globalSpeechState.nextSpeaker === sessionType && globalSpeechState.nextArea === 1)) ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}>
                  {speechText1}
                </span>
        </div>
        
        {/* 말풍선 생성 영역 2 */}
        <div style={{
          position: 'absolute',
          top: speechBubbleAreas[1].top,
          left: speechBubbleAreas[1].left,
          width: speechBubbleAreas[1].width,
          height: speechBubbleAreas[1].height,
          pointerEvents: 'none',
          zIndex: 100,
          overflow: 'hidden',
          borderRadius: '8px',
          border: '2px dashed blue',
          backgroundImage: (showSpeech2 || (globalSpeechState.nextSpeaker === sessionType && globalSpeechState.nextArea === 2)) ? 'url(/assets/booth/talk.png)' : 'none',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'scaleX(-1)', // 좌우반전
          opacity: (showSpeech2 || (globalSpeechState.nextSpeaker === sessionType && globalSpeechState.nextArea === 2)) ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}>
          <span style={{
            color: '#000000',
            fontSize: '12px',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '5px',
            textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
            marginBottom: '10px',
            transform: 'scaleX(-1)', // 텍스트도 다시 원래 방향으로
            opacity: (showSpeech2 || (globalSpeechState.nextSpeaker === sessionType && globalSpeechState.nextArea === 2)) ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
                      }}>
              {speechText2}
            </span>
        </div>
        
        {/* 바닥 조명 효과 */}
        <div style={{
          position: 'absolute',
          bottom: '-3px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '345px',
          height: '80px',
          backgroundColor: `rgba(255,255,255,0.15)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 15,
          filter: `drop-shadow(0 0 25px ${backgroundColorHex}50)` // 세션별 색상 글로우 효과 더 강화
        }} />
        
        {/* Stickman 컴포넌트 */}
        <div style={{ 
          position: 'relative', 
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: width,
          height: height,
          transform: `translate(${position.x || 0}px, ${position.y || 0}px)`
        }}>
          {children}
        </div>
        
        {/* 단상 이미지 */}
        {showStage && (
          <div style={{
            position: 'absolute',
            bottom: '-2px', // 더 아래쪽으로 이동
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            width: '400px', // width 증가
            height: '80px',
            backgroundColor: backgroundColorHex, // 세션별 대표 색상 적용
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            borderRadius: '150px 150px 0 0' // 타원의 절반 모양 (위쪽만 둥글게)
          }} />
        )}
      </div>
    </div>
  );
};

export default CylinderWrapper; 