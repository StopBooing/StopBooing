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
  const [accuracy, setAccuracy] = useState(100); // 정확도 (100%로 시작)

  useEffect(() => {
    
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight * 0.4, // 30%만 사용!
      parent: phaserRef.current,
      scene: [JamScene],
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      backgroundColor: '#000000',
    };
    const game = new Phaser.Game(config);
    gameRef.current = game;
    game.registry.set('myInstrument', 'keyboard');
    
    // 정확도 업데이트를 위한 이벤트 리스너 추가
    const handleAccuracyUpdate = (newAccuracy) => {
      setAccuracy(newAccuracy);
    };
    
    // 게임에서 정확도 업데이트 이벤트를 받을 수 있도록 설정
    game.events.on('accuracyUpdate', handleAccuracyUpdate);

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
      game.events.off('accuracyUpdate', handleAccuracyUpdate);
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
        {/* 가운데: 정확도 표시 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 40, fontWeight: 'bold', color: '#2196f3' }}>
            {accuracy.toFixed(1)}%
          </span>
        </div>
        {/* 오른쪽: 홈/설정 */}
        <div style={{ display: 'flex', gap: 18 }}>
          <button title="홈" style={{ fontSize: 22 }}>🏠</button>
          <button title="설정" style={{ fontSize: 22 }}>⚙️</button>
        </div>
      </div>
      <div ref={phaserRef} style={{ width: '100vw', height: '40vh',overflow: 'hidden' }} />
      <div style={{ display: 'flex', justifyContent: 'center',  flexDirection: 'row', width: '100vw', height: '50vh'}}>
        <StickmanGuitar width={200} height={200} />
        <StickmanDrum width={200} height={200} />
        <StickmanVocal width={200} height={200} />
        <StickmanPiano width={200} height={200} />
      </div>
    </div>
  );
} 