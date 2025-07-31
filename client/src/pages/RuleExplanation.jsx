import React, { useState, useEffect } from 'react';

const RuleExplanation = ({ onNext }) => {
  const [showTitle, setShowTitle] = useState(false);
  const [showRule1, setShowRule1] = useState(false);
  const [showRule2, setShowRule2] = useState(false);
  const [showRule3, setShowRule3] = useState(false);
  const [showRule4, setShowRule4] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // 제목 애니메이션 시작
    const titleTimer = setTimeout(() => {
      setShowTitle(true);
    }, 500);

    // 규칙 1 애니메이션 시작
    const rule1Timer = setTimeout(() => {
      setShowRule1(true);
    }, 1500);

    // 규칙 2 애니메이션 시작
    const rule2Timer = setTimeout(() => {
      setShowRule2(true);
    }, 2500);

    // 규칙 3 애니메이션 시작
    const rule3Timer = setTimeout(() => {
      setShowRule3(true);
    }, 3500);

    // 규칙 4 애니메이션 시작
    const rule4Timer = setTimeout(() => {
      setShowRule4(true);
    }, 4500);

    // 다음 버튼 애니메이션 시작
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 5500);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(rule1Timer);
      clearTimeout(rule2Timer);
      clearTimeout(rule3Timer);
      clearTimeout(rule4Timer);
      clearTimeout(buttonTimer);
    };
  }, []);
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#18171c',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: "'Noto Serif KR', serif",
      padding: '40px'
    }}>
      {/* 제목 */}
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '60px',
        textAlign: 'center',
        textShadow: '0 0 20px rgba(255,255,255,0.3)',
        letterSpacing: '0.1em',
        opacity: showTitle ? 1 : 0,
        transform: showTitle ? 'translateY(0)' : 'translateY(-30px)',
        transition: 'all 0.8s cubic-bezier(.4,2,.6,1)'
      }}>
        게임 규칙
      </h1>

      {/* 규칙 목록 */}
      <div style={{
        maxWidth: '800px',
        width: '100%',
        marginBottom: '60px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
            padding: '25px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: showRule1 ? 1 : 0,
            transform: showRule1 ? 'translateX(0)' : 'translateX(-50px)',
            transition: 'all 0.6s cubic-bezier(.4,2,.6,1)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#4a90e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              1
            </div>
            <div style={{
              fontSize: '1.3rem',
              lineHeight: '1.6',
              color: '#e0e0e0'
            }}>
              블럭이 흰색 선에 닿을 때 눌러야 한다.
            </div>
          </div>

          {/* 규칙 2 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
            padding: '25px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: showRule2 ? 1 : 0,
            transform: showRule2 ? 'translateX(0)' : 'translateX(-50px)',
            transition: 'all 0.6s cubic-bezier(.4,2,.6,1)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#4a90e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              2
            </div>
            <div style={{
              fontSize: '1.3rem',
              lineHeight: '1.6',
              color: '#e0e0e0'
            }}>
              정확한 타이밍에 누를수록 전체 정확도가 높아진다.
            </div>
          </div>

          {/* 규칙 3 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
            padding: '25px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: showRule3 ? 1 : 0,
            transform: showRule3 ? 'translateX(0)' : 'translateX(-50px)',
            transition: 'all 0.6s cubic-bezier(.4,2,.6,1)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#4a90e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              3
            </div>
            <div style={{
              fontSize: '1.3rem',
              lineHeight: '1.6',
              color: '#e0e0e0'
            }}>
              다른 사람 블럭 타이밍 때 누르면 안 된다. miss 난다.
            </div>
          </div>

          {/* 규칙 4 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
            padding: '25px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: showRule4 ? 1 : 0,
            transform: showRule4 ? 'translateX(0)' : 'translateX(-50px)',
            transition: 'all 0.6s cubic-bezier(.4,2,.6,1)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#4a90e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              4
            </div>
            <div style={{
              fontSize: '1.3rem',
              lineHeight: '1.6',
              color: '#e0e0e0'
            }}>
              모두가 힘을 합쳐서 전체 정확도를 높여야 한다.
            </div>
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={onNext}
        style={{
          backgroundColor: '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          padding: '18px 50px',
          fontSize: '1.3rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.6s cubic-bezier(.4,2,.6,1)',
          boxShadow: '0 4px 15px rgba(74,144,226,0.3)',
          fontFamily: "'Noto Serif KR', serif",
          opacity: showButton ? 1 : 0,
          transform: showButton ? 'translateY(0)' : 'translateY(30px)'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#357abd';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(74,144,226,0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#4a90e2';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(74,144,226,0.3)';
        }}
      >
        다음
      </button>
    </div>
  );
};

export default RuleExplanation; 