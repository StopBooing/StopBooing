import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import StartPage from './pages/StartPage';
import NicknameInput from './pages/NicknameInput';
import SongSelect from './pages/SongSelect';
import SessionSelect from './pages/SessionSelect';
import GameContainer from './pages/GameContainer';
import Result from './pages/Result';
import Stickman from './pages/Stickman';

export default function App() {
  const [nickname, setNickname] = useState('');
  const [song, setSong] = useState('');
  const [session, setSession] = useState('');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage  />} />
        <Route path="/nickname" element={<NicknameInput setNickname={setNickname} />} />
        <Route path="/song" element={<SongSelect setSong={setSong} />} />
        <Route path="/session" element={<SessionSelect setSession={setSession} />} />
        <Route path="/game" element={<GameContainer nickname={nickname} song={song} session={session} />} />
        <Route path="/result" element={<Result />} />
        <Route path="/stickman" element={<Stickman />} />
      </Routes>
    </Router>
  );
}
