import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Phaser from 'phaser';
import JamScene from '../game/scenes/JamScene';
import socket from '../services/socket';
import StickmanDrum from '../components/StickmanDrum';
import StickmanGuitar from '../components/StickmanGuitar';
import StickmanVocal from '../components/StickmanVocal';
import StickmanPiano from '../components/StickmanPiano';

import ComboDisplay from '../components/ComboDisplay';
import ComboBreakAlert from '../components/ComboBreakAlert';

import CylinderWrapper from '../components/CylinderWrapper';

const TOTAL_TIME = 120; // 전체 시간(초)

export default function GameContainer({ nickname, song, session }) {
  const mySession = session || 'keyboard'; // props에서 받거나 기본값 설정
  const phaserRef = useRef(null);
  const gameRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME); // 예시: 120초 남음
  const [accuracy, setAccuracy] = useState(100); // 정확도 (100%로 시작)
  const [gameStats, setGameStats] = useState({
    combo: 0,
    accuracy: 100,
    score: 0
  });
  const [comboBreak, setComboBreak] = useState(0);

  // 커튼 애니메이션 상태
  const [curtainOpen, setCurtainOpen] = useState(false);
  const handleCurtainAnimate = () => setCurtainOpen(true);

  useEffect(() => {
    console.log('GameContainer: 받은 session prop:', session);
    console.log('GameContainer: 사용할 mySession:', mySession);
    
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
    };
    const game = new Phaser.Game(config);
    gameRef.current = game;
    game.registry.set('myInstrument', mySession);
    
    // 게임 통계 업데이트를 위한 이벤트 리스너들
    const handleGameStatsUpdate = (stats) => {
      setGameStats(stats);
      setAccuracy(stats.accuracy);
    };

    const handleComboUpdate = (combo) => {
      setGameStats(prev => ({ ...prev, combo }));
    };

    const handleAccuracyUpdate = (newAccuracy) => {
      setAccuracy(newAccuracy);
      setGameStats(prev => ({ ...prev, accuracy: newAccuracy }));
    };

    const handleComboBreak = (brokenCombo) => {
      setComboBreak(brokenCombo);
    };
    
    // 게임에서 이벤트를 받을 수 있도록 설정
    game.events.on('gameStatsUpdate', handleGameStatsUpdate);
    game.events.on('comboUpdate', handleComboUpdate);
    game.events.on('accuracyUpdate', handleAccuracyUpdate);
    game.events.on('comboBreak', handleComboBreak);

    const handleResize = () => {
      if (game && game.scale) {
        game.scale.resize(window.innerWidth * 0.4, window.innerHeight * 0.9);
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
      game.events.off('gameStatsUpdate', handleGameStatsUpdate);
      game.events.off('comboUpdate', handleComboUpdate);
      game.events.off('accuracyUpdate', handleAccuracyUpdate);
      game.events.off('comboBreak', handleComboBreak);
      game.destroy(true);
    };
  }, []);

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
      position: 'relative',
      display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #18171c 0%, #23222a 100%)', // 어두운 Deemo 스타일
      overflow: 'hidden',
      fontFamily: "'Noto Serif KR', serif"
    }}>
      {/* 상단 바 */}
      <div style={{
        width: '100vw', height: '10vh', background: 'rgba(24,23,28,0.95)', color: '#f5f5f5',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2vw', boxSizing: 'border-box',
        boxShadow: '0 2px 16px #000a', borderBottom: '1.5px solid #23222a',
        fontFamily: "'Noto Serif KR', serif"
      }}>
        {/* 왼쪽: 잔여시간 + 프로그레스 바 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '70vw'}}>
          <div style={{ width: '70vw', height: '10px', background: '#23222a', borderRadius: 4, marginTop: 4, overflow: 'hidden', marginRight: 10 }}>
            <div style={{ width: `${percent * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6e5e4e 0%, #bfae9c 100%)', transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: '#bfae9c' }}>
            {timeLeft} / {TOTAL_TIME}
          </div>

        </div>  
        {/* 가운데: 정확도 및 콤보 표시 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 40, fontWeight: 'bold', color: '#2196f3' }}>
            {accuracy.toFixed(1)}%
          </span>
          {gameStats.combo > 0 && (
            <span style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              color: gameStats.combo >= 30 ? '#ff6600' : gameStats.combo >= 20 ? '#ffff00' : '#00ff00',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              {gameStats.combo} COMBO
            </span>
          )}
          <span style={{ fontSize: 16, color: '#ffff00', fontWeight: 'bold' }}>
            Score: {gameStats.score.toLocaleString()}
          </span>
        </div>
        {/* 오른쪽: 홈/설정 */}
        <div style={{ display: 'flex', gap: 18 }}>
          <button title="홈" style={{
            fontSize: 22, background: '#23222a', color: '#bfae9c', border: '1.5px solid #6e5e4e', borderRadius: 16,
            boxShadow: '0 2px 8px #0006', padding: '6px 18px', fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s', outline: 'none'
          }}>🏠</button>
          <button title="설정" style={{
            fontSize: 22, background: '#23222a', color: '#bfae9c', border: '1.5px solid #6e5e4e', borderRadius: 16,
            boxShadow: '0 2px 8px #0006', padding: '6px 18px', fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s', outline: 'none'
          }}>⚙️</button>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '90vh'}}>  
        {/* 왼쪽 영역 */}
        {/* <div style={{display: 'flex', flexDirection: 'column', width: '30vw', height: '90vh', background: 'transparent',alignItems: 'center',justifyContent: 'center'}}>
          <CylinderWrapper width={400} height={300} showBooth={false} showStage={true} sessionType="drum" position={{x: 0, y: 20}}>
            <StickmanDrum width={200} height={200} />
          </CylinderWrapper>
          <CylinderWrapper width={400} height={300} showBooth={false} showStage={true} sessionType="guitar" position={{x: 30, y: 10}}>
            <StickmanGuitar width={200} height={200} />
          </CylinderWrapper>
        </div> */}
        {/* 중앙 연주 영역 */}
        <div ref={phaserRef} style={{ width: '40vw', height: '90vh', overflow: 'hidden', background: 'transparent',alignContent: 'center' }} />
        {/* 오른쪽 영역 */}
        {/* <div style={{display: 'flex', flexDirection: 'column', width: '30vw', height: '90vh', background: 'transparent',alignItems: 'center',justifyContent: 'center'}}>
          <CylinderWrapper width={400} height={300} showBooth={false} showStage={true} sessionType="vocal">
            <StickmanVocal width={200} height={200} />
          </CylinderWrapper>
          <CylinderWrapper width={400} height={300} showBooth={false} showStage={true} sessionType="keyboard" position={{x: 0, y: 30}}>
            <StickmanPiano width={200} height={200} />
          </CylinderWrapper>
        </div> */}
      </div>
      
      {/* 콤보 표시 UI */}
      <ComboDisplay 
        combo={gameStats.combo}
        accuracy={gameStats.accuracy}
        score={gameStats.score}
      />
      
      {/* 콤보 브레이크 알림 */}
      <ComboBreakAlert comboBreak={comboBreak} />
    </div>
  );
} 