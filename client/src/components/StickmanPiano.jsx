// src/components/StickmanGuitar.jsx
import React, { useEffect } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import socket from '../services/socket';

// ──────────────────────────────
// 편집기에서 만든 이름들
const STATE_MACHINE = "PianoAnimation";
const LEFTHIT_TRIGGER  = "leftHitTrigger";   // Trigger (play)
const RIGHTHIT_TRIGGER  = "rightHitTrigger";   // Trigger (play)
const DOUBLEHIT_TRIGGER  = "doubleHitTrigger";   // Trigger (play)
const ANNOYING_TRIGGER  = "annoyingTrigger";   // Trigger (play)
// ──────────────────────────────

export default function StickmanVocal({width, height}) {
    
  /* ① Rive 인스턴스 + Canvas ref */
  const { rive, canvasRef, RiveComponent } = useRive({
    src: "/assets/animations/stickman_piano.riv",
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
  const leftHitTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    LEFTHIT_TRIGGER
  );
  const rightHitTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    RIGHTHIT_TRIGGER
  );
  const doubleHitTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    DOUBLEHIT_TRIGGER
  );
  const annoyingTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    ANNOYING_TRIGGER
  );
  useEffect(()=>{
    console.log('PIANO: useEffect 실행됨');
    
    const handleHitFromServer = (type) => {
      console.log('HITfromSERVER_PIANO IN PIANO',type);
      console.log('PIANO: type === keyboard?', type === 'keyboard');
      if(type === 'keyboard'){
        const availableTriggers = [rightHitTrigger, leftHitTrigger, doubleHitTrigger].filter(trigger => trigger);
        if(availableTriggers.length > 0){
          const randomTrigger = availableTriggers[Math.floor(Math.random() * availableTriggers.length)];
          console.log('랜덤 트리거 파이어:', randomTrigger);
          randomTrigger.fire();
        }
      }
    };

    const handleKeyboardMissAnimation = () => {
      console.log('키보드 miss 애니메이션 트리거');
      if(annoyingTrigger) {
        annoyingTrigger.fire();
      }
    };
    
    socket.off('HITfromSERVER_KEYBOARD');
    socket.on('HITfromSERVER_KEYBOARD', handleHitFromServer);
    
    socket.off('KEYBOARD_MISS_ANIMATION');
    socket.on('KEYBOARD_MISS_ANIMATION', handleKeyboardMissAnimation);
    
    socket.off('ACCURACYfromSERVER');
    socket.on('ACCURACYfromSERVER',(data)=>{
        console.log('ACCURACYfromSERVER',data);
    });
    
    return () => {
      socket.off('HITfromSERVER_KEYBOARD', handleHitFromServer);
      socket.off('KEYBOARD_MISS_ANIMATION', handleKeyboardMissAnimation);
      socket.off('ACCURACYfromSERVER');
    };
  },[leftHitTrigger,rightHitTrigger,doubleHitTrigger,annoyingTrigger]);

  return (
    <div style={{ textAlign: "center" }}>
      {/* ④ Rive 캔버스 (사이즈는 아트보드 비율 기준) */}
      {RiveComponent && (
        <RiveComponent 
          style={{ 
            width: width, 
            height: height,
            transform: 'scale(1.9)',
            transformOrigin: 'center center'
          }} 
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
{/* 
      <button
        onClick={() => {
          if (leftHitTrigger) {
            leftHitTrigger.fire();
          }
        }}
        style={{ marginTop: 12 }}
      >
        leftHitTrigger
      </button>
      <button
        onClick={() => {
          if (rightHitTrigger) {
            rightHitTrigger.fire();
          }
        }}
        style={{ marginTop: 12 }}
      >
        rightHitTrigger
      </button>
      <button
        onClick={() => {
          if (doubleHitTrigger) {
            doubleHitTrigger.fire();
          }
        }}
        style={{ marginTop: 12 }}
      >
        doubleHitTrigger
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
