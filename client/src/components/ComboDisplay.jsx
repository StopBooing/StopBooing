import React, { useState, useEffect } from 'react';

const ComboDisplay = ({ combo, accuracy, score }) => {
  const [displayCombo, setDisplayCombo] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComboText, setShowComboText] = useState(false);

  useEffect(() => {
    if (combo > 0) {
      setDisplayCombo(combo);
      setIsAnimating(true);
      setShowComboText(true);
      
      // 애니메이션 효과
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setDisplayCombo(0);
      setShowComboText(false);
    }
  }, [combo]);

  const getComboColor = () => {
    if (combo >= 50) return '#ff0000'; // 빨간색 (50콤보 이상)
    if (combo >= 30) return '#ff6600'; // 주황색 (30콤보 이상)
    if (combo >= 20) return '#ffff00'; // 노란색 (20콤보 이상)
    if (combo >= 10) return '#00ff00'; // 초록색 (10콤보 이상)
    return '#ffffff'; // 흰색 (기본)
  };

  const getComboSize = () => {
    if (combo >= 50) return '48px';
    if (combo >= 30) return '42px';
    if (combo >= 20) return '36px';
    if (combo >= 10) return '30px';
    return '24px';
  };

  const getComboGlow = () => {
    if (combo >= 50) return '0 0 20px #ff0000, 0 0 40px #ff0000';
    if (combo >= 30) return '0 0 15px #ff6600, 0 0 30px #ff6600';
    if (combo >= 20) return '0 0 10px #ffff00, 0 0 20px #ffff00';
    if (combo >= 10) return '0 0 5px #00ff00, 0 0 10px #00ff00';
    return 'none';
  };

  return (
    <div style={{
      position: 'absolute',
      top: '120px',
      right: '20px',
      zIndex: 1000,
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      pointerEvents: 'none'
    }}>
      {/* 콤보 표시 */}
      {showComboText && (
        <div style={{
          fontSize: getComboSize(),
          fontWeight: 'bold',
          color: getComboColor(),
          textShadow: `2px 2px 4px rgba(0,0,0,0.8), ${getComboGlow()}`,
          transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
          transition: 'all 0.3s ease-in-out',
          marginBottom: '10px',
          animation: combo >= 20 ? 'pulse 1s infinite' : 'none'
        }}>
          {displayCombo} COMBO
          {combo >= 30 && (
            <div style={{
              fontSize: '12px',
              color: '#ffffff',
              marginTop: '5px',
              animation: 'sparkle 0.5s infinite'
            }}>
              🔥 AMAZING! 🔥
            </div>
          )}
        </div>
      )}
      
      {/* 정확도 표시 */}
      {accuracy !== undefined && (
        <div style={{
          fontSize: '18px',
          color: '#ffffff',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '5px 10px',
          borderRadius: '5px',
          marginBottom: '5px'
        }}>
          Accuracy: {accuracy}%
        </div>
      )}
      
      {/* 점수 표시 */}
      {score !== undefined && (
        <div style={{
          fontSize: '16px',
          color: '#ffff00',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '5px 10px',
          borderRadius: '5px'
        }}>
          Score: {score.toLocaleString()}
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ComboDisplay; 