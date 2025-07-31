
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import StartPage from './pages/StartPage';
import NicknameInput from './pages/NicknameInput';
import RuleExplanation from './pages/RuleExplanation';
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
  const [selectedInstrument, setSelectedInstrument] = useState("keyboard");
  
  const handleInstrumentSelect = async (instrumentId) => {
    console.log(`App: ${instrumentId}가 선택되었습니다. 게임을 시작합니다.`);
    setSelectedInstrument(instrumentId);
    console.log(selectedInstrument);
  };

  // 테스트용 결과 데이터
  const testResultData = {
    songTitle: "Don't look back in anger",
    totalGrade: "A", // 여기서 등급 변경: "D", "C", "B", "A", "S" 중 선택
    sessionResults: {
      drum: { accuracy: "95%", perfect: 150 },
      guitar: { accuracy: "92%", perfect: 120 },
      vocal: { accuracy: "88%", perfect: 95 },
      piano: { accuracy: "96%", perfect: 180 }
    },
    onHomeClick: () => window.location.href = '/'
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage  />} />
        <Route path="/rules" element={<RuleExplanation onNext={() => window.location.href = '/nickname'} />} />
        <Route path="/nickname" element={<NicknameInput setNickname={setNickname} />} />
        <Route path="/song" element={<SongSelect setSong={setSong} />} />
        <Route path="/session" element={<SessionSelect setSession={setSession} />} />
        <Route path="/game" element={<GameContainer nickname={nickname} song={song} session={session} />} />
        <Route path="/result" element={<Result {...testResultData} />} />
        <Route path="/stickman" element={<Stickman />} />
        <Route path="/instrument" element={<InstrumentSelectionComponent onInstrumentSelect={handleInstrumentSelect} />} />
        <Route path="/cgame" element={<PhaserGame instrument={selectedInstrument} />} />
      </Routes>
    </Router>
  );
}

