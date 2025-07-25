import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';

export default function SongSelect({setSong }) {
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
    <div>
      <h2>노래 선택</h2>
      <div>
        <h4>현재 접속 유저 ({users.length}명):</h4>
        <ul>
          {users.map(u => (
            <li key={u.id}>{u.nickname}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4>노래 목록:</h4>
        <ul>
          {songs.map(song => (
            <li key={song.id}>
              <button
                style={{ fontWeight: selected === song.id ? 'bold' : 'normal' }}
                onClick={() => handleVote(song.id)}
                disabled={!!selected}
              >
                {song.title} - {song.artist}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selected && <p>투표 완료! 다른 유저의 투표를 기다리는 중...</p>}
    </div>
  );
} 