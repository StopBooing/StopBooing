import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SessionSelect({ setSession}) {
  const [session, setLocalSession] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    if (!session) return;
    // 필요시 socket.emit('join_session', session);
    setSession(session);
    navigate('/game');
  };

  return (
    <div>
      <h2>세션 선택</h2>
      <input value={session} onChange={e => setLocalSession(e.target.value)} placeholder="세션 이름" />
      <button onClick={handleNext}>게임 시작</button>
    </div>
  );
} 