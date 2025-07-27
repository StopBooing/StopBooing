import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from '../game/MainScene';

export default function GameCanvas() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'phaser-container',
        scene: [MainScene],
      });
    }

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return <div id="phaser-container" />;
}
