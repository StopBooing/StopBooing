import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { io } from 'socket.io-client';

import JamScene from '../game/JamScene';

// App 컴포넌트로부터 instrument prop을 받습니다.
function PhaserGame({ instrument }) {
  const gameRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) {
      return;
    }

    // 소켓 연결을 여기서 단 한 번만 생성합니다.
    socketRef.current = io('http://localhost:3001', { autoConnect: false });
    if(socketRef.current) socketRef.current.connect();

    socketRef.current.on('connect', () => {
      console.log('PhaserGame: 서버에 연결되었습니다.', socketRef.current.id);
    });

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
        height: 600
      },
      parent: 'phaser-game-container',
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
      },
      scene: [JamScene]
    });

    gameRef.current = game;

    // 소켓 인스턴스를 게임의 모든 씬에서 접근할 수 있도록 레지스트리에 저장합니다.
    game.registry.set('socket', socketRef.current);
    // 선택된 악기 정보를 게임 레지스트리에 저장합니다.
    game.registry.set('myInstrument', instrument);

    return () => {
      if (gameRef.current) {
        // JamScene의 cleanup 메서드 호출
        const jamScene = gameRef.current.scene.getScene('JamScene');
        if (jamScene && jamScene.cleanup) {
          jamScene.cleanup();
        }
        
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [instrument]); // instrument prop이 변경될 때 useEffect가 다시 실행될 수 있도록 의존성 배열에 추가

  return (
    <div id="phaser-game-container" style={{ width: '100vw', height: '100vh' }}>
      {/* Phaser 게임 캔버스가 이 안에 삽입됩니다. */}
    </div>
  );
}

export default PhaserGame;