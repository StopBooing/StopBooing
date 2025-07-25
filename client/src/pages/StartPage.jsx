import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

export default function StartPage({ setSocket }) {
  const navigate = useNavigate();
  const handleStart = () => {
    const socket = io('http://localhost:3001');
    setSocket(socket);
    navigate('/nickname');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
      <h2>리듬게임</h2>
      <button style={{ fontSize: 24, padding: '16px 32px' }} onClick={handleStart}>게임 시작</button>
    </div>
  );
} 