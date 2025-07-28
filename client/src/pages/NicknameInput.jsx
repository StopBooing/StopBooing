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
    // cleanup
    return () => {
      socket.off('nickname_already_taken');
      socket.off('room_already_full');
      socket.off('nickname_registered');
    };
  }, [socket, setNickname, navigate]);

  const handleNext = async () => {
    if (!nickname) return;
    socket.emit('check_nickname', nickname);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#111',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Noto Serif KR', 'serif'",
        position: 'relative'
      }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        boxShadow: '0 4px 32px #0006',
        padding: '48px 36px 36px 36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 340
      }}>
        <h2 style={{
          color: '#fff',
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 4,
          marginBottom: 32,
          textShadow: '0 2px 12px #000a'
        }}>
          닉네임 입력
        </h2>
        <input
          value={nickname}
          onChange={e => setLocalNickname(e.target.value)}
          placeholder="닉네임"
          style={{
            fontSize: 22,
            padding: '14px 24px',
            borderRadius: 16,
            border: '1.5px solid #eee',
            outline: 'none',
            marginBottom: 28,
            background: '#222',
            color: '#fff',
            width: 220,
            boxShadow: '0 2px 12px #0002',
            textAlign: 'center',
            transition: 'border 0.2s, background 0.2s'
          }}
          onFocus={e => e.target.style.border = '1.5px solid #43c6ac'}
          onBlur={e => e.target.style.border = '1.5px solid #eee'}
          maxLength={12}
        />
        <button
          onClick={handleNext}
          style={{
            fontSize: 22,
            padding: '12px 48px',
            borderRadius: 24,
            border: '1.5px solid #eee',
            background: '#fff',
            color: '#222',
            fontWeight: 700,
            boxShadow: '0 2px 12px #0002',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s',
            marginTop: 8
          }}
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
            e.currentTarget.style.boxShadow = '0 2px 12px #0002';
          }}
        >
          다음
        </button>
      </div>
    </div>
  );
} 