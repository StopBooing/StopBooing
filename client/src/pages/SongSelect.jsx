import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';

export default function SongSelect({ setSong }) {
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/songs')
      .then(res => res.json())
      .then(data => setSongs(data.songs || []));
    fetch('http://localhost:3001/api/users')
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
    if (!socket) return;
    socket.on('song_selected', (songId) => {
      const song = songs.find(s => s.id === songId);
      alert(`최종 선택된 곡: ${song ? song.title : songId}`);
      setSong(songId);
      navigate('/session');
    });
    return () => {
      if (socket) socket.off('song_selected');
    };
    // eslint-disable-next-line
  }, [socket, songs, navigate, setSong]);

  const handleVote = (songId) => {
    setSelected(songId);
    socket.emit('vote_song', songId);
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
        minWidth: 340,
        maxWidth: 480
      }}>
        <h2 style={{
          color: '#fff',
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 4,
          marginBottom: 24,
          textShadow: '0 2px 12px #000a'
        }}>
          노래 선택
        </h2>
        <div style={{ marginBottom: 28, width: '100%' }}>
          <h4 style={{ color: '#fff8', fontSize: 18, marginBottom: 8, letterSpacing: 2 }}>현재 접속 유저 ({users.length}명):</h4>
          <ul style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, listStyle: 'none', padding: 0, margin: 0
          }}>
            {users.map(u => (
              <li key={u.id} style={{
                background: '#222', color: '#fff', borderRadius: 12, padding: '6px 16px', fontSize: 16, boxShadow: '0 1px 6px #0002'
              }}>{u.nickname}</li>
            ))}
          </ul>
        </div>
        <div style={{ width: '100%' }}>
          <h4 style={{ color: '#fff8', fontSize: 18, marginBottom: 8, letterSpacing: 2 }}>노래 목록:</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {songs.map(song => (
              <li key={song.id}>
                <button
                  style={{
                    width: '100%',
                    fontSize: 20,
                    fontWeight: 600,
                    padding: '16px 0',
                    borderRadius: 16,
                    border: selected === song.id ? '2px solid #43c6ac' : '1.5px solid #eee',
                    background: selected === song.id ? '#e0f7fa' : '#fff',
                    color: selected === song.id ? '#222' : '#222',
                    boxShadow: selected === song.id ? '0 4px 24px #43c6ac33' : '0 2px 12px #0002',
                    cursor: selected ? 'default' : 'pointer',
                    transition: 'background 0.2s, border 0.2s, box-shadow 0.2s, transform 0.1s',
                    outline: 'none',
                  }}
                  onClick={() => handleVote(song.id)}
                  disabled={!!selected}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseEnter={e => {
                    if (!selected) {
                      e.currentTarget.style.background = '#f5f5f5';
                      e.currentTarget.style.boxShadow = '0 8px 32px #0003';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!selected) {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.boxShadow = '0 2px 12px #0002';
                    }
                  }}
                >
                  {song.title} <span style={{ color: '#888', fontWeight: 400 }}>- {song.artist}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {selected && <p style={{ color: '#43c6ac', fontWeight: 600, marginTop: 24, fontSize: 18 }}>투표 완료! 다른 유저의 투표를 기다리는 중...</p>}
      </div>
    </div>
  );
} 