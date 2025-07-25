import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';
import socket from '../services/socket';

const TOTAL_TIME = 120; // 전체 시간(초)

export default function GameContainer({ nickname, song, session }) {
  const phaserRef = useRef(null);
  const gameRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME); // 예시: 120초 남음

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: phaserRef.current,
      scene: [GameScene],
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      backgroundColor: '#222',
    };
    const game = new Phaser.Game(config);
    gameRef.current = game;

    const handleResize = () => {
      if (game && game.scale) {
        game.scale.resize(window.innerWidth, window.innerHeight * 0.9);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        width: '100vw', height: '10vh', background: '#111', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2vw', boxSizing: 'border-box'
      }}>
        {/* 왼쪽: 잔여시간 + 프로그레스 바 */}
        <div style={{ display: 'flex',alignItems: 'flex-start', width: '70vw'}}>
          <div style={{ width: '70vw', height: '10px', background: '#333', borderRadius: 4, marginTop: 4, overflow: 'hidden', marginRight: 10 }}>
            <div style={{ width: `${percent * 100}%`, height: '100%', background: '#2196f3', transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            {timeLeft} / {TOTAL_TIME}
          </div>
        </div>  
        {/* 가운데: 주요 버튼 */}
        <div style={{ display: 'flex', gap: 18 }}>
          <button title="재생" style={{ fontSize: 22 }} onClick={handlePlay}>▶️</button>
          <button title="초기화" style={{ fontSize: 22 }}>🔄</button>
          <button title="다음" style={{ fontSize: 22 }}>⏭️</button>
        </div>
        {/* 오른쪽: 홈/설정 */}
        <div style={{ display: 'flex', gap: 18 }}>
          <button title="홈" style={{ fontSize: 22 }}>🏠</button>
          <button title="설정" style={{ fontSize: 22 }}>⚙️</button>
        </div>
      </div>
      <div ref={phaserRef} style={{ width: '100vw', height: '90vh', overflow: 'hidden' }} />
    </div>
  );
} 