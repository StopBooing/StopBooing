import React from 'react';

const GRADE_LIST = ['D', 'C', 'B', 'A', 'S'];

const Result = ({ songTitle, totalGrade, sessionResults, onHomeClick }) => {
  // 현재 등급 인덱스
  const gradeIndex = GRADE_LIST.indexOf(totalGrade || 'S');

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
              fontSize: gradeIndex === idx ? '4rem' : '2.5rem',
              fontWeight: gradeIndex === idx ? 'bold' : 'normal',
              color:
                idx < gradeIndex ? 'rgba(200,200,200,0.3)' :
                idx === gradeIndex ? '#ffd700' :
                'rgba(200,200,200,0.3)',
              opacity: idx === gradeIndex ? 1 : 0.5,
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
              textShadow: gradeIndex === idx ? '0 0 20px #ffd700, 0 0 40px #ffd70080' : 'none',
              transform: gradeIndex === idx ? 'scale(1.2)' : 'scale(1)'
            }}>
              {grade}
              {/* 강조 효과 */}
              {gradeIndex === idx && (
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '100%',
                  transform: 'translate(-50%, 0)',
                  marginTop: '8px',
                  fontSize: '1.1rem',
                  color: '#ffd700',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  animation: 'bounce 1.2s infinite',
                  whiteSpace: 'nowrap',
                  textShadow: '0 0 10px #ffd70080'
                }}>
                  여기까지 도달!
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
          gap: '40px',
          width: '90%',
          maxWidth: '1200px',
          justifyContent: 'center'
        }}>
          {/* Drum */}
          <div style={{
            backgroundColor: 'rgba(204,0,204,0.1)',
            border: '2px solid #cc00cc',
            borderRadius: '10px',
            padding: '30px 20px',
            textAlign: 'center',
            flex: 1,
            minWidth: '200px',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
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
            padding: '30px 20px',
            textAlign: 'center',
            flex: 1,
            minWidth: '200px',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
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
            padding: '30px 20px',
            textAlign: 'center',
            flex: 1,
            minWidth: '200px',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
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

          {/* Keyboard */}
          <div style={{
            backgroundColor: 'rgba(0,204,0,0.1)',
            border: '2px solid #00cc00',
            borderRadius: '10px',
            padding: '30px 20px',
            textAlign: 'center',
            flex: 1,
            minWidth: '200px',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
                          <h3 style={{ color: '#00cc00', margin: '0 0 20px 0', fontSize: '1.5rem' }}>Keyboard</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '15px' }}>
                              {sessionResults?.keyboard?.accuracy || '96%'}
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
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(74,144,226,0.3)'
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