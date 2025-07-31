import React, { useState, useEffect } from 'react';
import { SESSION_COLORS } from '../game/constants/GameConstants.js';


const CylinderWrapper = ({ children, width = 200, height = 200, showBooth = false, position = {}, showStage = true, sessionType = 'keyboard', currentSession = 'keyboard' }) => {
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [musicNotes, setMusicNotes] = useState([]);

  // 세션별 대표 색상 가져오기
  const sessionColor = SESSION_COLORS[sessionType]?.TAP || SESSION_COLORS.keyboard.TAP;
  const backgroundColorHex = '#' + sessionColor.toString(16).padStart(6, '0');

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
        boxShadow: `0 0 0 12px ${sessionType === currentSession ? backgroundColorHex : '#46464c'}, inset -6px -6px 12px rgba(0,0,0,0.4), inset 6px 6px 12px rgba(255,255,255,0.2)`, // 조건부 테두리 색상
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
          border: '2px dashed blue',
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