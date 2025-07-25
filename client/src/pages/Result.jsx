import { useNavigate } from 'react-router-dom';

export default function Result() {
  const navigate = useNavigate();
  return (
    <div>
      <h2>결과 화면</h2>
      <button onClick={() => navigate('/')}>처음으로</button>
    </div>
  );
} 