import { useNavigate } from 'react-router-dom';

export default function StartPage() {
  const navigate = useNavigate();
  const handleStart = () => {
    navigate('/nickname');
  };
  // floating animation keyframes (CSS-in-JS)
  const floatAnim = `@keyframes floatTitle {
    0% { transform: translateY(0); }
    50% { transform: translateY(-24px); }
    100% { transform: translateY(0); }
  }`;
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#111', // 완전 검정 배경
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Noto Serif KR', 'serif'",
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* floating animation style */}
      <style>{floatAnim}</style>
      {/* 빛나는 원 효과 */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fff1 0%, #0000 80%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      {/* 타이틀 */}
      <h1
        style={{
          color: '#fff',
          fontSize: 64,
          letterSpacing: 8,
          fontWeight: 700,
          textShadow: '0 4px 24px #000a, 0 1px 0 #fff4',
          marginBottom: 40,
          zIndex: 1,
          animation: 'floatTitle 2.5s ease-in-out infinite',
        }}
      >
        Rhythm Game
      </h1>
      {/* 시작 버튼 */}
      <button
  style={{
    fontSize: 28,
    padding: '18px 60px',
    borderRadius: 40,
    border: '1.5px solid #eee',
    background: '#fff',
    color: '#222',
    fontWeight: 700,
    boxShadow: '0 4px 24px #0002',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s',
    zIndex: 1
  }}
  onClick={handleStart}
  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
  onMouseEnter={e => {
    e.currentTarget.style.background = '#f5f5f5';
    e.currentTarget.style.color = '#111';
    e.currentTarget.style.boxShadow = '0 8px 32px #0003';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = '#fff';
    e.currentTarget.style.color = '#222';
    e.currentTarget.style.boxShadow = '0 4px 24px #0002';
  }}
>
  게임 시작
</button>
      {/* 하단 크레딧 */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        color: '#fff8',
        fontSize: 16,
        letterSpacing: 2,
        zIndex: 1
      }}>
        Inspired by Deemo
      </div>
    </div>
  );
}