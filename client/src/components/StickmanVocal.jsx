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
    src: "/animations/stickman_vocal.riv",
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
    socket.on('HITfromSERVER',(data)=>{
        console.log('HITfromSERVER',data);
    });
    socket.on('ACCURACYfromSERVER',(data)=>{
        console.log('ACCURACYfromSERVER',data);
    });
  },[]);

  return (
    <div style={{ textAlign: "center" }}>
      {/* ④ Rive 캔버스 (사이즈는 아트보드 비율 기준) */}
      {RiveComponent && (
        <RiveComponent 
          style={{ 
            width: width, 
            height: height, 
            border: '1px solid red' 
          }} 
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center' }}>

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
      </button>
      </div>
    </div>
  );
}
