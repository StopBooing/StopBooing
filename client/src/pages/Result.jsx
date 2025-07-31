import React from 'react';

const GRADE_LIST = ['D', 'C', 'B', 'A', 'S'];

// 등급별 색상과 멘트 설정
const GRADE_STYLES = {
  'D': {
    color: '#ff4444',
    textShadow: '0 0 20px #ff4444, 0 0 40px #ff444480',
    message: '다시 도전해보세요!'
  },
  'C': {
    color: '#00cc44',
    textShadow: '0 0 20px #00cc44, 0 0 40px #00cc4480',
    message: '조금만 더 노력하면!'
  },
  'B': {
    color: '#44aaff',
    textShadow: '0 0 20px #44aaff, 0 0 40px #44aaff80',
    message: '괜찮은 실력이에요!'
  },
  'A': {
    color: '#ff44ff',
    textShadow: '0 0 20px #ff44ff, 0 0 40px #ff44ff80',
    message: '훌륭한 실력이에요!'
  },
  'S': {
    color: '#ffd700',
    textShadow: '0 0 20px #ffd700, 0 0 40px #ffd70080',
    message: '완벽한 실력이에요!'
  }
};

const Result = ({ songTitle, totalGrade, sessionResults, onHomeClick }) => {
  const [showGradeAnimation, setShowGradeAnimation] = React.useState(false);
  const [showSessionCards, setShowSessionCards] = React.useState(false);
  const [showHomeButton, setShowHomeButton] = React.useState(false);
  
  // 현재 등급 인덱스
  const gradeIndex = GRADE_LIST.indexOf(totalGrade || 'S');
  
  // 컴포넌트 마운트 후 1초 뒤에 등급 애니메이션 시작
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowGradeAnimation(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 등급 애니메이션 완료 후 (1.8초 후) 세션 카드 애니메이션 시작
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSessionCards(true);
    }, 2800); // 1초 + 0.8초(등급 애니메이션 시간)
    
    return () => clearTimeout(timer);
  }, []);
  
  // 세션 카드 애니메이션 완료 후 (3.4초 후) 홈 버튼 애니메이션 시작
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowHomeButton(true);
    }, 4000); // 1초 + 0.8초 + 1.2초(세션 카드 애니메이션 시간)
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#18171c',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 1. 노래 제목 출력 영역 (height: 2) */}
      <div style={{
        height: '20vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '2px solid #333',
        backgroundColor: 'rgba(255,255,255,0.05)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          margin: 0,
          textShadow: '0 0 10px rgba(255,255,255,0.3)'
        }}>
          {songTitle || '노래 제목'}
        </h1>
      </div>

      {/* 2. 총 등급 출력 영역 (height: 2) */}
      <div style={{
        height: '20vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '2px solid #333',
        backgroundColor: 'rgba(255,255,255,0.03)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '40px',
          marginBottom: '10px',
        }}>
          {GRADE_LIST.map((grade, idx) => (
            <div key={grade} style={{
              fontSize: showGradeAnimation && gradeIndex === idx ? '4rem' : '2.5rem',
              fontWeight: showGradeAnimation && gradeIndex === idx ? 'bold' : 'normal',
              color: showGradeAnimation ? 
                (idx < gradeIndex ? 'rgba(200,200,200,0.3)' :
                 idx === gradeIndex ? GRADE_STYLES[totalGrade || 'S'].color :
                 'rgba(200,200,200,0.3)') :
                'rgba(200,200,200,0.3)',
              opacity: showGradeAnimation && idx === gradeIndex ? 1 : 0.5,
              position: 'relative',
              transition: 'all 0.8s cubic-bezier(.4,2,.6,1)',
              textShadow: showGradeAnimation && gradeIndex === idx ? GRADE_STYLES[totalGrade || 'S'].textShadow : 'none',
              transform: showGradeAnimation && gradeIndex === idx ? 'scale(1.2)' : 'scale(1)'
            }}>
              {grade}
              {/* 강조 효과 */}
              {showGradeAnimation && gradeIndex === idx && (
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '100%',
                  transform: 'translate(-50%, 0)',
                  marginTop: '8px',
                  fontSize: '1.1rem',
                  color: GRADE_STYLES[totalGrade || 'S'].color,
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  animation: 'bounce 1.2s infinite',
                  whiteSpace: 'nowrap',
                  textShadow: `0 0 10px ${GRADE_STYLES[totalGrade || 'S'].color}80`
                }}>
                  {GRADE_STYLES[totalGrade || 'S'].message}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* 애니메이션 keyframes */}
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translate(-50%, 0); }
            50% { transform: translate(-50%, -10px); }
          }
        `}</style>
      </div>

      {/* 3. 각 세션별 정확도 등 출력 영역 (height: 5) */}
      <div style={{
        height: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '2px solid #333',
        backgroundColor: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          width: '95%',
          maxWidth: '1400px',
          justifyContent: 'space-between'
        }}>
          {/* Drum */}
          <div style={{
            backgroundColor: 'rgba(204,0,204,0.1)',
            border: '2px solid #cc00cc',
            borderRadius: '10px',
            padding: '25px 15px',
            textAlign: 'center',
            flex: 1,
            minWidth: '180px',
            height: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: showSessionCards ? 1 : 0,
            transform: showSessionCards ? 'translateX(0)' : 'translateX(-100px)',
            transition: 'all 0.6s cubic-bezier(.4,2,.6,1)',
            transitionDelay: '0s'
          }}>
            <h3 style={{ color: '#cc00cc', margin: '0 0 20px 0', fontSize: '1.5rem' }}>Drum</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '15px' }}>
              {sessionResults?.drum?.accuracy || '95%'}
            </div>
            <div style={{ fontSize: '1rem', color: '#ccc', lineHeight: '1.5' }}>
              <div>Perfect: {sessionResults?.drum?.perfect || 150}</div>
              <div>Good: {sessionResults?.drum?.good || 20}</div>
              <div>Bad: {sessionResults?.drum?.bad || 5}</div>
              <div>Miss: {sessionResults?.drum?.miss || 2}</div>
            </div>
          </div>

          {/* Guitar */}
          <div style={{
            backgroundColor: 'rgba(255,102,0,0.1)',
            border: '2px solid #ff6600',
            borderRadius: '10px',
            padding: '25px 15px',
            textAlign: 'center',
            flex: 1,
            minWidth: '180px',
            height: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: showSessionCards ? 1 : 0,
            transform: showSessionCards ? 'translateX(0)' : 'translateX(-100px)',
            transition: 'all 0.6s cubic-bezier(.4,2,.6,1)',
            transitionDelay: '0.2s'
          }}>
            <h3 style={{ color: '#ff6600', margin: '0 0 20px 0', fontSize: '1.5rem' }}>Guitar</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '15px' }}>
              {sessionResults?.guitar?.accuracy || '92%'}
            </div>
            <div style={{ fontSize: '1rem', color: '#ccc', lineHeight: '1.5' }}>
              <div>Perfect: {sessionResults?.guitar?.perfect || 120}</div>
              <div>Good: {sessionResults?.guitar?.good || 15}</div>
              <div>Bad: {sessionResults?.guitar?.bad || 8}</div>
              <div>Miss: {sessionResults?.guitar?.miss || 3}</div>
            </div>
          </div>

          {/* Vocal */}
          <div style={{
            backgroundColor: 'rgba(255,0,102,0.1)',
            border: '2px solid #ff0066',
            borderRadius: '10px',
            padding: '25px 15px',
            textAlign: 'center',
            flex: 1,
            minWidth: '180px',
            height: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: showSessionCards ? 1 : 0,
            transform: showSessionCards ? 'translateX(0)' : 'translateX(-100px)',
            transition: 'all 0.6s cubic-bezier(.4,2,.6,1)',
            transitionDelay: '0.4s'
          }}>
            <h3 style={{ color: '#ff0066', margin: '0 0 20px 0', fontSize: '1.5rem' }}>Vocal</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '15px' }}>
              {sessionResults?.vocal?.accuracy || '88%'}
            </div>
            <div style={{ fontSize: '1rem', color: '#ccc', lineHeight: '1.5' }}>
              <div>Perfect: {sessionResults?.vocal?.perfect || 95}</div>
              <div>Good: {sessionResults?.vocal?.good || 25}</div>
              <div>Bad: {sessionResults?.vocal?.bad || 12}</div>
              <div>Miss: {sessionResults?.vocal?.miss || 8}</div>
            </div>
          </div>

          {/* Piano */}
          <div style={{
            backgroundColor: 'rgba(0,204,0,0.1)',
            border: '2px solid #00cc00',
            borderRadius: '10px',
            padding: '25px 15px',
            textAlign: 'center',
            flex: 1,
            minWidth: '180px',
            height: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: showSessionCards ? 1 : 0,
            transform: showSessionCards ? 'translateX(0)' : 'translateX(-100px)',
            transition: 'all 0.6s cubic-bezier(.4,2,.6,1)',
            transitionDelay: '0.6s'
          }}>
            <h3 style={{ color: '#00cc00', margin: '0 0 20px 0', fontSize: '1.5rem' }}>Piano</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '15px' }}>
              {sessionResults?.piano?.accuracy || '96%'}
            </div>
            <div style={{ fontSize: '1rem', color: '#ccc', lineHeight: '1.5' }}>
              <div>Perfect: {sessionResults?.piano?.perfect || 180}</div>
              <div>Good: {sessionResults?.piano?.good || 18}</div>
              <div>Bad: {sessionResults?.piano?.bad || 4}</div>
              <div>Miss: {sessionResults?.piano?.miss || 1}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 홈버튼 영역 (height: 1) */}
      <div style={{
        height: '10vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.01)'
      }}>
        <button 
          onClick={onHomeClick}
          style={{
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '15px 40px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.6s cubic-bezier(.4,2,.6,1)',
            boxShadow: '0 4px 15px rgba(74,144,226,0.3)',
            opacity: showHomeButton ? 1 : 0,
            transform: showHomeButton ? 'translateY(0)' : 'translateY(50px)'
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
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default Result; 