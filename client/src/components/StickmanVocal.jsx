// src/components/StickmanGuitar.jsx
import React, { useEffect } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import socket from '../services/socket';

// ──────────────────────────────
// 편집기에서 만든 이름들
const STATE_MACHINE = "State Machine 1";
const LEGMOVE_TRIGGER  = "legMoveTrigger";   // Trigger (play)
const MAKEHANDLING_TRIGGER  = "makeHandlingTrigger";   // Trigger (play)
const SING_TRIGGER  = "singTrigger";   // Trigger (play)
const ANNOYING_TRIGGER  = "annoyingTrigger";   // Trigger (play)
// ──────────────────────────────

export default function StickmanVocal({width, height}) {
    
  /* ① Rive 인스턴스 + Canvas ref */
  const { rive, canvasRef, RiveComponent } = useRive({
    src: "/assets/animations/stickman_vocal.riv",
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
  const legMoveTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    LEGMOVE_TRIGGER
  );
  const makeHandlingTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    MAKEHANDLING_TRIGGER
  );
  const singTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    SING_TRIGGER
  );
  const annoyingTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    ANNOYING_TRIGGER
  );
  useEffect(()=>{
    console.log('VOCAL: useEffect 실행됨');
    
    const handleHitFromServer = (type) => {
        console.log('HITfromSERVER_VOCAL IN VOCAL',type);
        console.log('VOCAL: type === vocal?', type === 'vocal');
        if(type === 'vocal'){
          const availableTriggers = [singTrigger].filter(trigger => trigger);
          if(availableTriggers.length > 0){
            const randomTrigger = availableTriggers[Math.floor(Math.random() * availableTriggers.length)];
            console.log('랜덤 트리거 파이어:', randomTrigger);
            randomTrigger.fire();
          }
        }
    };

    const handleVocalMissAnimation = () => {
      console.log('보컬 miss 애니메이션 트리거');
      if(annoyingTrigger) {
        annoyingTrigger.fire();
      }
    };
    
    socket.off('HITfromSERVER_VOCAL');
    socket.on('HITfromSERVER_VOCAL', handleHitFromServer);
    
    socket.off('VOCAL_MISS_ANIMATION');
    socket.on('VOCAL_MISS_ANIMATION', handleVocalMissAnimation);
    
    socket.on('ACCURACYfromSERVER',(data)=>{
        // console.log('ACCURACYfromSERVER',data);
    });
    
    return () => {
      socket.off('HITfromSERVER_VOCAL', handleHitFromServer);
      socket.off('VOCAL_MISS_ANIMATION', handleVocalMissAnimation);
      socket.off('ACCURACYfromSERVER');
    };
  },[singTrigger,annoyingTrigger,legMoveTrigger,makeHandlingTrigger]);

  return (
    <div style={{ textAlign: "center" }}>
      {/* ④ Rive 캔버스 (사이즈는 아트보드 비율 기준) */}
      {RiveComponent && (
        <RiveComponent 
          style={{ 
            width: width, 
            height: height,
            transform: 'scale(1.7)',
            transformOrigin: 'center center'
          }} 
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
{/* 
      <button
        onClick={() => {
          if (legMoveTrigger) {
            legMoveTrigger.fire();
          }
        }}
        style={{ marginTop: 12 }}
      >
        legMoveTrigger
      </button>
      <button
        onClick={() => {
          if (makeHandlingTrigger) {
            makeHandlingTrigger.fire();
          }
        }}
        style={{ marginTop: 12 }}
      >
        makeHandlingTrigger
      </button>
      <button
        onClick={() => {
          if (singTrigger) {
            singTrigger.fire();
          }
        }}
        style={{ marginTop: 12 }}
      >
        singTrigger
      </button>
      <button
        onClick={() => {
          if (annoyingTrigger) {
            annoyingTrigger.fire();
          }
        }}
        style={{ marginTop: 12 }}
      >
        annoyingTrigger
      </button> */}
      </div>
    </div>
  );
}
