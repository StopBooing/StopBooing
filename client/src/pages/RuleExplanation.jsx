import React from 'react';

const RuleExplanation = ({ onNext }) => {
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
        letterSpacing: '0.1em'
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
          {/* 규칙 1 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
            padding: '25px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(255,255,255,0.1)'
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
            border: '1px solid rgba(255,255,255,0.1)'
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
            border: '1px solid rgba(255,255,255,0.1)'
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
            border: '1px solid rgba(255,255,255,0.1)'
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
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(74,144,226,0.3)',
          fontFamily: "'Noto Serif KR', serif"
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