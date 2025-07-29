import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import JamScene from '../game/JamScene';
import socket from '../services/socket';
import StickmanDrum from '../components/StickmanDrum';
import StickmanGuitar from '../components/StickmanGuitar';
import StickmanVocal from '../components/StickmanVocal';
import StickmanPiano from '../components/StickmanPiano';
const TOTAL_TIME = 120; // 전체 시간(초)

export default function GameContainer({ nickname, song, session }) {
  const phaserRef = useRef(null);
  const gameRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME); // 예시: 120초 남음

  // 커튼 애니메이션 상태
  const [curtainOpen, setCurtainOpen] = useState(false);
  const handleCurtainAnimate = () => setCurtainOpen(true);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight * 0.4, // 40%만 사용!
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
    game.registry.set('myInstrument', 'drum');

    const handleResize = () => {
      if (game && game.scale) {
        game.scale.resize(window.innerWidth, window.innerHeight * 0.4);
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
  const leftCurtainStyle = {
    position: 'absolute',
    left: 0, top: 0, height: '100%',
    width: curtainOpen ? '100px' : '300px',
    background: 'url(/assets/background/curtain.png) left top no-repeat',
    backgroundSize: curtainOpen ? '200% 100%' : '300% 100%',
    backgroundPosition: 'left top',
    zIndex: 10,
    pointerEvents: 'none',
    transition: 'width 0.8s cubic-bezier(.77,0,.18,1), background-size 0.8s cubic-bezier(.77,0,.18,1)'
  };
  // 오른쪽 커튼 스타일 동적 적용
  const rightCurtainStyle = {
    position: 'absolute',
    right: 0, top: 0, height: '100%',
    width: curtainOpen ? '100px' : '300px',
    background: 'url(/assets/background/curtain.png) right top no-repeat',
    backgroundSize: curtainOpen ? '200% 100%' : '300% 100%',
    backgroundPosition: 'right top',
    zIndex: 10,
    pointerEvents: 'none',
    transition: 'width 0.8s cubic-bezier(.77,0,.18,1), background-size 0.8s cubic-bezier(.77,0,.18,1)'
  };

  return (
    <div style={{
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
        {/* 가운데: 주요 버튼 */}
        <div style={{ display: 'flex', gap: 18 }}>
          <button title="재생" style={{
            fontSize: 22, background: '#23222a', color: '#bfae9c', border: '1.5px solid #6e5e4e', borderRadius: 16,
            boxShadow: '0 2px 8px #0006', padding: '6px 18px', fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s', outline: 'none'
          }} onClick={handlePlay}>▶️</button>
          <button title="초기화" style={{
            fontSize: 22, background: '#23222a', color: '#bfae9c', border: '1.5px solid #6e5e4e', borderRadius: 16,
            boxShadow: '0 2px 8px #0006', padding: '6px 18px', fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s', outline: 'none'
          }}>🔄</button>
          <button title="다음" style={{
            fontSize: 22, background: '#23222a', color: '#bfae9c', border: '1.5px solid #6e5e4e', borderRadius: 16,
            boxShadow: '0 2px 8px #0006', padding: '6px 18px', fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s', outline: 'none'
          }}>⏭️</button>
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
        {/* Phaser 게임 영역 */}
        <div ref={phaserRef} style={{ width: '60vw', height: '90vh', overflow: 'hidden', background: 'transparent',alignContent: 'center' }} />
        {/* Stickman 영역 (무대 + 커튼 PNG 양쪽 배치) */}
        <div style={{
          position: 'relative',
          width: '40vw', height: '90vh',
          background: 'linear-gradient(180deg, #23222a 0%, #18171c 100%)',
        }}>
          {/* 커튼 애니메이션 버튼 */}
          <button onClick={handleCurtainAnimate} style={{
            position: 'absolute', top: 24, left: 24, zIndex: 1000,
            background: '#b22222', color: '#fff', border: 'none', borderRadius: 16, fontSize: 18, fontWeight: 700,
            padding: '10px 28px', boxShadow: '0 2px 12px #0006', cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s'
          }}>커튼 애니메이션</button>
          {/* 왼쪽 커튼 (애니메이션) */}
          <div style={leftCurtainStyle} />
          {/* 오른쪽 커튼 (애니메이션) */}
          <div style={rightCurtainStyle} />
          {/* StickmanGuitar */}
          <div style={{
            position: 'absolute',
            left: '20%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}>
            <StickmanGuitar width={200} height={200} />
          </div>
          {/* StickmanDrum + StickmanVocal */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '30%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}>
            <StickmanDrum width={200} height={200} />
          </div>
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '60%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}>
            <StickmanVocal width={200} height={200} />
          </div>
          {/* StickmanPiano */}
          <div style={{
            position: 'absolute',
            right: '20%',
            top: '50%',
            transform: 'translate(50%, -50%)',
            zIndex: 2
          }}>
            <StickmanPiano width={200} height={200} />
          </div>
        </div>
      </div>
    </div>
  );
} 