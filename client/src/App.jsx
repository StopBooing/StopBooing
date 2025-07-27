
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import * as Tone from 'tone';
import StartPage from './pages/StartPage';
import NicknameInput from './pages/NicknameInput';
import SongSelect from './pages/SongSelect';
import SessionSelect from './pages/SessionSelect';
import GameContainer from './pages/GameContainer';
import Result from './pages/Result';
import Stickman from './pages/Stickman';
import PhaserGame from './components/PhaserGame.jsx';

import InstrumentSelectionComponent from './components/InstrumentSelectionComponent.jsx';

export default function App() {
  const [nickname, setNickname] = useState('');
  const [song, setSong] = useState('');
  const [session, setSession] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const handleInstrumentSelect = async (instrumentId) => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      console.log('AudioContext가 성공적으로 시작되었습니다.');
    }
    console.log(`App: ${instrumentId}가 선택되었습니다. 게임을 시작합니다.`);
    setSelectedInstrument(instrumentId);
  };

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
        <Route path="/instrument" element={<InstrumentSelectionComponent onInstrumentSelect={handleInstrumentSelect} />} />
        <Route path="/cgame" element={<PhaserGame instrument={selectedInstrument} />} />
      </Routes>
    </Router>
  );
}

