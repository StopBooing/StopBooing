import React, { useState, useEffect } from 'react';

const ComboBreakAlert = ({ comboBreak }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [brokenCombo, setBrokenCombo] = useState(0);

  useEffect(() => {
    if (comboBreak > 0) {
      setBrokenCombo(comboBreak);
      setIsVisible(true);
      
      // 3초 후 자동으로 숨김
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [comboBreak]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 2000,
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      pointerEvents: 'none'
    }}>
      <div style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#ff0000',
        textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '20px 40px',
        borderRadius: '10px',
        border: '3px solid #ff0000',
        animation: 'shake 0.5s ease-in-out'
      }}>
        COMBO BREAK!
        <div style={{
          fontSize: '24px',
          color: '#ffffff',
          marginTop: '10px'
        }}>
          {brokenCombo} 콤보 끊김
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-50%, -50%) rotate(-2deg); }
          75% { transform: translate(-50%, -50%) rotate(2deg); }
        }
      `}</style>
    </div>
  );
};

export default ComboBreakAlert; 