// src/components/StickmanGuitar.jsx
import React, { useEffect } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import socket from '../services/socket';
// ──────────────────────────────
// 편집기에서 만든 이름들
const STATE_MACHINE = "State Machine 1";
const TRIGGER_NAME  = "playTrigger";   // Trigger (play)
const ANNOYING_TRIGGER  = "annoyingTrigger";   // Trigger (play)
// ──────────────────────────────

export default function StickmanGuitar({width, height}) {
  /* ① Rive 인스턴스 + Canvas ref */
  const { rive, canvasRef, RiveComponent } = useRive({
    src: "/assets/animations/stickman_guitar.riv",
    stateMachines: STATE_MACHINE, // 임시로 주석처리
    autoplay: true,
    onStateChange: (event) => {
      console.log("Rive state changed:", event);
    },
    onError: (error) => {
      console.error("Rive loading error:", error);
    },
  });

  /* ② Trigger 핸들 얻기 */
  const playTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    TRIGGER_NAME
  );
  const annoyingTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    ANNOYING_TRIGGER
  );
  useEffect(()=>{
    console.log('GUITAR: useEffect 실행됨');
    
    const handleHitFromServer = (type) => {
        if(type === 'guitar'){
          const availableTriggers = [playTrigger].filter(trigger => trigger);
          if(availableTriggers.length > 0){
            const randomTrigger = availableTriggers[Math.floor(Math.random() * availableTriggers.length)];
            console.log('랜덤 트리거 파이어:', randomTrigger);
            randomTrigger.fire();
          }
        }
    };

    const handleGuitarMissAnimation = () => {
      console.log('기타 miss 애니메이션 트리거');
      if(annoyingTrigger) {
        annoyingTrigger.fire();
      }
    };
    
    socket.off('HITfromSERVER_GUITAR');
    socket.on('HITfromSERVER_GUITAR', handleHitFromServer);
    
    socket.off('GUITAR_MISS_ANIMATION');
    socket.on('GUITAR_MISS_ANIMATION', handleGuitarMissAnimation);
    
    return () => {
      socket.off('HITfromSERVER_GUITAR', handleHitFromServer);
      socket.off('GUITAR_MISS_ANIMATION', handleGuitarMissAnimation);
    };
  },[playTrigger, annoyingTrigger]); 

//   // 디버깅용 로그
//   console.log("Rive instance:", rive);
//   console.log("Canvas ref:", canvasRef);
//   console.log("Play trigger:", playTrigger);

  return (
    <div style={{ textAlign: "center" }}>
      {/* ④ Rive 캔버스 (사이즈는 아트보드 비율 기준) */}
      {RiveComponent && (
        <RiveComponent 
          style={{ 
            width: width, 
            height: height,
            transform: 'scale(1.8)',
            transformOrigin: 'center center'
          }} 
        />
      )}
      {/* ⑤ Trigger 버튼 */}
      {/* <button
        onClick={() => {
          console.log("Strum 버튼 클릭됨");
          if (playTrigger) {
            playTrigger.fire();
            console.log("Trigger 실행됨");
          } else {
            console.log("Trigger가 아직 준비되지 않음");
          }
        }}
        style={{ marginTop: 12 }}
      >
        Strum !
      </button> */}
    </div>
  );
}
