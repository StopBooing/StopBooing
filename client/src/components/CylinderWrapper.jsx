import React from 'react';
import { SESSION_COLORS } from '../game/constants/GameConstants.js';

const CylinderWrapper = ({ children, width = 200, height = 200, showBooth = false, position = {}, showStage = true, sessionType = 'keyboard' }) => {
  // 세션별 대표 색상 가져오기
  const sessionColor = SESSION_COLORS[sessionType]?.TAP || SESSION_COLORS.keyboard.TAP;
  const backgroundColorHex = '#' + sessionColor.toString(16).padStart(6, '0');

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
        height: '500px',
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
        boxShadow: `0 0 0 4px ${backgroundColorHex}, inset -6px -6px 12px rgba(0,0,0,0.4), inset 6px 6px 12px rgba(255,255,255,0.2)`, // 더 강한 입체감 효과
        overflow: 'visible' // 스포트라이트 빔이 컨테이너 밖으로 나갈 수 있도록
      }}>
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