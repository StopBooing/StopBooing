// src/components/StickmanGuitar.jsx
import React, { useEffect } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import socket from '../services/socket';

// ──────────────────────────────
// 편집기에서 만든 이름들
const STATE_MACHINE = "DrumAnimation";
const RIGHT_HIT_TRIGGER  = "rightHitTrigger";   // Trigger (play)
const LEFT_HIT_TRIGGER  = "leftHitTrigger";   // Trigger (play)
const HIT_TRIGGER  = "hitTrigger";   // Trigger (play)
const ANOYING_TRIGGER  = "anoyingTrigger";   // Trigger (play)
// ──────────────────────────────

export default function StickmanGuitar({width, height}) {
    
  /* ① Rive 인스턴스 + Canvas ref */
  const { rive, canvasRef, RiveComponent } = useRive({
    src: "/assets/animations/stickman_drum.riv",
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
  const rightHitTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    RIGHT_HIT_TRIGGER
  );
  const hitTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    HIT_TRIGGER
  );
  const leftHitTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    LEFT_HIT_TRIGGER
  );
  const anoyingTrigger = useStateMachineInput(
    rive,
    STATE_MACHINE,
    ANOYING_TRIGGER
  );
  useEffect(()=>{
    console.log('DRUM: useEffect 실행됨');
    
        const handleHitFromServer = (type) => {
      console.log('HITfromSERVER_DRUM IN DRUM',type);
      console.log('DRUM: type === drum?', type === 'drum');
        if(type === 'drum'){
          console.log('DRUM: 애니메이션 실행!');
          if(rightHitTrigger) {
            rightHitTrigger.fire();
          }
        }
    };
    
    socket.off('HITfromSERVER_DRUM');
    socket.on('HITfromSERVER_DRUM', handleHitFromServer);
    
    socket.off('ACCURACYfromSERVER');
    socket.on('ACCURACYfromSERVER',(data)=>{
        console.log('ACCURACYfromSERVER',data);
    });
    
    return () => {
      socket.off('HITfromSERVER_DRUM', handleHitFromServer);
      socket.off('ACCURACYfromSERVER');
    };
  },[rightHitTrigger,hitTrigger,leftHitTrigger,anoyingTrigger]);

  return (
    <div style={{ textAlign: "center" }}>
      {/* ④ Rive 캔버스 (사이즈는 아트보드 비율 기준) */}
      {RiveComponent && (
        <RiveComponent 
          style={{ 
            width: width, 
            height: height,
            transform: 'scale(1.2)',
            transformOrigin: 'center center'
          }} 
        />
      )}
      {!RiveComponent && (
        <div style={{ 
          width: 400, 
          height: 650, 
          border: '1px solid red',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0'
        }}>
          Rive 컴포넌트 로딩 중...
        </div>
      )}

      {/* ⑤ Trigger 버튼 */}
      {/* <button
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
          if (hitTrigger) {
            hitTrigger.fire();
          }
        }}
        style={{ marginTop: 12 }}
      >
        hitTrigger
      </button>
      <button
        onClick={() => {
          if (anoyingTrigger) {
            anoyingTrigger.fire();
          }
        }}
        style={{ marginTop: 12 }}
      >
        anoyingTrigger
      </button> */}
    </div>
  );
}
