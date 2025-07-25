import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';

export default function NicknameInput({ setNickname }) {
  const [nickname, setLocalNickname] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('nickname_already_taken', () => {
      alert('이미 사용중인 닉네임입니다.');
    });
    socket.on('room_already_full', () => {
      alert('방이 꽉 찼습니다.');
    });
    socket.on('nickname_registered', (nickname) => {
      console.log('닉네임 등록 완료, nickname : ', nickname);
      setNickname(nickname);
      navigate('/song');
    });
  }, [socket]);

  const handleNext = async () => {
    if (!nickname) return;
    socket.emit('check_nickname', nickname);
  };

  return (
    <div>
      <h2>닉네임 입력</h2>
      <input value={nickname} onChange={e => setLocalNickname(e.target.value)} placeholder="닉네임" />
      <button onClick={handleNext}>다음</button>
    </div>
  );
} 