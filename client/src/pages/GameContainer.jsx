import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import JamScene from '../game/JamScene';
import socket from '../services/socket';
import StickmanDrum from '../components/StickmanDrum';
import StickmanGuitar from '../components/StickmanGuitar';
import StickmanVocal from '../components/StickmanVocal';
import StickmanPiano from '../components/StickmanPiano';
import CylinderWrapper from '../components/CylinderWrapper';
import { SESSION_COLORS } from '../game/constants/GameConstants';

const TOTAL_TIME = 120; // 전체 시간(초)

export default function GameContainer({ nickname, song, session }) {
  const phaserRef = useRef(null);
  const gameRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME); // 예시: 120초 남음
  const [accuracy, setAccuracy] = useState(100); // 정확도 (100%로 시작)
  const [countdown, setCountdown] = useState(0); // 카운트다운 상태 (0이면 비활성화)
  const [countdownComplete, setCountdownComplete] = useState(false); // 카운트다운 완료 상태
  
  // 각 세션별 정확도 상태
  const [sessionAccuracies, setSessionAccuracies] = useState({
    drum: 100,
    guitar: 100,
    vocal: 100,
    piano: 100
  });

  // 세션별 대표 색상 가져오기
  const sessionColor = SESSION_COLORS[session]?.TAP || SESSION_COLORS.piano.TAP;
  const backgroundColorHex = '#' + sessionColor.toString(16).padStart(6, '0');

  // 커튼 애니메이션 상태
  const [curtainOpen, setCurtainOpen] = useState(false);
  const handleCurtainAnimate = () => setCurtainOpen(true);

  useEffect(() => {
    console.log(`컨테이너 크기: ${window.innerWidth * 0.4} x ${window.innerHeight * 0.9}`);
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth * 0.4, // 40vw에 맞춤
      height: window.innerHeight * 0.9, // 90vh에 맞춤
      parent: phaserRef.current,
      scene: [JamScene],
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      backgroundColor: '#18171c', // 어두운 무대 배경
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };
    const game = new Phaser.Game(config);
    gameRef.current = game;
    game.registry.set('myInstrument', session);
    
    // 정확도 업데이트를 위한 이벤트 리스너 추가
    const handleAccuracyUpdate = (newAccuracy) => {
      setAccuracy(newAccuracy);
    };
    
    // 게임에서 정확도 업데이트 이벤트를 받을 수 있도록 설정
    game.events.on('accuracyUpdate', handleAccuracyUpdate);
    
    // 카운트다운 이벤트 리스너 추가
    const handleCountdown = (count) => {
      console.log('React에서 카운트다운 이벤트 받음:', count);
      setCountdown(count);
      
      // 카운트다운이 완료되면 (0이 되면) 완료 상태로 설정
      if (count === 0) {
        setCountdownComplete(true);
      }
    };
    
    // 씬이 생성된 후 이벤트 리스너 등록
    const setupSceneEvents = () => {
      const scene = game.scene.getScene('JamScene');
      if (scene) {
        scene.events.on('countdown', handleCountdown);
        console.log('JamScene 이벤트 리스너 등록 완료');
        
        // 이벤트 리스너가 등록된 후 카운트다운 시작 신호 전달
        scene.events.emit('readyForCountdown');
      } else {
        // 씬이 아직 준비되지 않았으면 잠시 후 다시 시도
        setTimeout(setupSceneEvents, 100);
      }
    };
    
    // 게임이 준비되면 씬 이벤트 설정
    game.events.once('ready', setupSceneEvents);
    
    // 백업: 직접 씬에 접근 시도
    setTimeout(setupSceneEvents, 500);

    const handleResize = () => {
      if (game && game.scale) {
        // 실제 컨테이너 크기에 맞춰서 게임 크기 조정
        const containerWidth = window.innerWidth * 0.4;
        const containerHeight = window.innerHeight * 0.9;
        console.log(`리사이즈: ${containerWidth} x ${containerHeight}`);
        game.scale.resize(containerWidth, containerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // 예시: 1초마다 남은 시간 감소
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
      game.events.off('accuracyUpdate', handleAccuracyUpdate);
      
      // 씬에서 이벤트 리스너 제거
      const scene = game.scene.getScene('JamScene');
      if (scene) {
        scene.events.off('countdown', handleCountdown);
      }
      
      game.destroy(true);
    };
  }, []); // session과 backgroundColorHex 의존성 제거

  // 남은 시간 비율(0~1)
  const percent = Math.max(0, Math.min(1, timeLeft / TOTAL_TIME));

  // 예시: 버튼에서 socket 사용
  const handlePlay = () => {
    socket.emit('play');
  };

  // 왼쪽 커튼 스타일 동적 적용
  // const leftCurtainStyle = {
  //   position: 'absolute',
  //   left: 0, top: 0, height: '100%',
  //   width: curtainOpen ? '100px' : '300px',
  //   background: 'url(/assets/background/curtain.png) left top no-repeat',
  //   backgroundSize: curtainOpen ? '200% 100%' : '300% 100%',
  //   backgroundPosition: 'left top',
  //   zIndex: 10,
  //   pointerEvents: 'none',
  //   transition: 'width 0.8s cubic-bezier(.77,0,.18,1), background-size 0.8s cubic-bezier(.77,0,.18,1)'
  // };
  // 오른쪽 커튼 스타일 동적 적용
  // const rightCurtainStyle = {
  //   position: 'absolute',
  //   right: 0, top: 0, height: '100%',
  //   width: curtainOpen ? '100px' : '300px',
  //   background: 'url(/assets/background/curtain.png) right top no-repeat',
  //   backgroundSize: curtainOpen ? '200% 100%' : '300% 100%',
  //   backgroundPosition: 'right top',
  //   zIndex: 10,
  //   pointerEvents: 'none',
  //   transition: 'width 0.8s cubic-bezier(.77,0,.18,1), background-size 0.8s cubic-bezier(.77,0,.18,1)'
  // };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #18171c 0%, #23222a 100%)', // 어두운 Deemo 스타일
      overflow: 'hidden',
      fontFamily: "'Noto Serif KR', serif",
      position: 'relative'
    }}>
      
      {/* 카운트다운 오버레이 */}
      {countdown > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '120px',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            userSelect: 'none'
          }}>
            {countdown}
          </div>
        </div>
      )}
      {/* 상단 바 */}
      <div style={{
        width: '100vw', height: '10vh', background: 'rgba(24,23,28,0.95)', color: '#f5f5f5',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2vw', boxSizing: 'border-box',
        boxShadow: '0 2px 16px #000a', borderBottom: '1.5px solid #23222a',
        fontFamily: "'Noto Serif KR', serif"
      }}>
        {/* 왼쪽: 잔여시간 + 프로그레스 바 (비율 7) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '65%'}}>
          <div style={{ width: '90%', height: '30px', background: '#23222a', borderRadius: 4, marginTop: 4, overflow: 'hidden', marginRight: 10 }}>
            <div style={{ width: `${percent * 100}%`, height: '100%', background: `linear-gradient(90deg, ${backgroundColorHex}80 0%, ${backgroundColorHex} 100%)`, transition: 'width 0.3s', borderRadius: 4 }} />
          </div>
          <div style={{ width: '10%', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, color: backgroundColorHex, marginLeft: 20 }}>
            {timeLeft} / {TOTAL_TIME}
          </div>
        </div>  
        {/* 가운데: 세션별 정확도 표시 (비율 3) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 50, width: '35%', justifyContent: 'center' }}>
          {/* DRUM 세션 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 5,
            // 조건부 스타일 적용
                         ...(session === 'drum' && { // 'session'이 'drum'일 때만 아래 스타일 객체가 추가됨
               padding: '10px 20px',
               border: '4px solid #cc00cc',
               borderRadius: '8px',
               zIndex: 9999,
               color: '#cc00cc',
               animation: 'sessionBorderGlow 2s ease-in-out infinite'
             })
          }}>
            <span style={{ fontSize: 15, fontWeight: 'bold', color: '#bfae9c' }}>DRUM</span>
            <span style={{ fontSize: 25, fontWeight: 'bold', color: SESSION_COLORS.drum.TAP.toString(16).padStart(6, '0').startsWith('0') ? '#' + SESSION_COLORS.drum.TAP.toString(16).padStart(6, '0') : '#' + SESSION_COLORS.drum.TAP.toString(16) }}>
              {sessionAccuracies.drum.toFixed(1)}%
            </span>
          </div>

          {/* VOCAL 세션 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 5,
                         ...(session === 'vocal' && {
               padding: '10px 20px',
               border: '4px solid #ff0066',
               borderRadius: '8px',
               zIndex: 9999,
               color: '#ff0066',
               animation: 'sessionBorderGlow 2s ease-in-out infinite'
             })
          }}>
            <span style={{ fontSize: 15, fontWeight: 'bold', color: '#bfae9c' }}>VOCAL</span>
            <span style={{ fontSize: 25, fontWeight: 'bold', color: SESSION_COLORS.vocal.TAP.toString(16).padStart(6, '0').startsWith('0') ? '#' + SESSION_COLORS.vocal.TAP.toString(16).padStart(6, '0') : '#' + SESSION_COLORS.vocal.TAP.toString(16) }}>
              {sessionAccuracies.vocal.toFixed(1)}%
            </span>
          </div>

          {/* GUITAR 세션 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 5,
                         ...(session === 'guitar' && {
               padding: '10px 20px',
               border: '4px solid #ff6600',
               borderRadius: '8px',
               zIndex: 9999,
               color: '#ff6600',
               animation: 'sessionBorderGlow 2s ease-in-out infinite'
             })
          }}>
            <span style={{ fontSize: 15, fontWeight: 'bold', color: '#bfae9c' }}>GUITAR</span>
            <span style={{ fontSize: 25, fontWeight: 'bold', color: SESSION_COLORS.guitar.TAP.toString(16).padStart(6, '0').startsWith('0') ? '#' + SESSION_COLORS.guitar.TAP.toString(16).padStart(6, '0') : '#' + SESSION_COLORS.guitar.TAP.toString(16) }}>
              {sessionAccuracies.guitar.toFixed(1)}%
            </span>
          </div>

          {/* PIANO 세션 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 5,
                         ...(session === 'keyboard' && {
               padding: '10px 20px',
               border: '4px solid #00cc00',
               borderRadius: '8px',
               zIndex: 9999,
               color: '#00cc00',
               animation: 'sessionBorderGlow 2s ease-in-out infinite'
             })
          }}>
            <span style={{ fontSize: 15, fontWeight: 'bold', color: '#bfae9c' }}>PIANO</span>
            <span style={{ fontSize: 25, fontWeight: 'bold', color: SESSION_COLORS.piano.TAP.toString(16).padStart(6, '0').startsWith('0') ? '#' + SESSION_COLORS.piano.TAP.toString(16).padStart(6, '0') : '#' + SESSION_COLORS.piano.TAP.toString(16) }}>
              {sessionAccuracies.piano.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '90vh'}}>  
        {/* 왼쪽 영역 */}
        <div style={{display: 'flex', flexDirection: 'column', width: '30vw', height: '90vh', background: 'transparent',alignItems: 'center',justifyContent: 'center'}}>
          <CylinderWrapper width={400} height={300} showBooth={false} showStage={true} sessionType="drum" currentSession={session} position={{x: 0, y: 20}} countdownComplete={countdownComplete}>
            <StickmanDrum width={200} height={200} />
          </CylinderWrapper>
          <CylinderWrapper width={400} height={300} showBooth={false} showStage={true} sessionType="guitar" currentSession={session} position={{x: 30, y: 10}} countdownComplete={countdownComplete}>
            <StickmanGuitar width={200} height={200} />
          </CylinderWrapper>
        </div>
        {/* 중앙 연주 영역 */}
        <div ref={phaserRef} style={{ 
          width: '40vw', 
          height: '90vh', 
          overflow: 'hidden', 
          // background: `linear-gradient(180deg, #18171c 0%, ${backgroundColorHex}20 50%, ${backgroundColorHex}40 100%)`,
          alignContent: 'center' 
        }} />
        {/* 오른쪽 영역 */}
        <div style={{display: 'flex', flexDirection: 'column', width: '30vw', height: '90vh', background: 'transparent',alignItems: 'center',justifyContent: 'center'}}>
          <CylinderWrapper width={400} height={300} showBooth={false} showStage={true} sessionType="vocal" currentSession={session} countdownComplete={countdownComplete}>
            <StickmanVocal width={200} height={200} />
          </CylinderWrapper>
          <CylinderWrapper width={400} height={300} showBooth={false} showStage={true} sessionType="piano" currentSession={session} position={{x: 0, y: 30}} countdownComplete={countdownComplete}>
            <StickmanPiano width={200} height={200} />
          </CylinderWrapper>
        </div>
      </div>
    </div>
  );
} 