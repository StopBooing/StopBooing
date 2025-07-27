import React, { useState } from 'react';
import PhaserGame from './components/PhaserGame.jsx';
import InstrumentSelectionComponent from './components/InstrumentSelectionComponent.jsx';
import * as Tone from 'tone';

function App() {
  // 사용자가 선택한 악기를 저장할 상태. 초기값은 null.
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  // 악기 선택 컴포넌트에서 악기를 선택했을 때 호출될 함수
  const handleInstrumentSelect = async (instrumentId) => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      console.log('AudioContext가 성공적으로 시작되었습니다.');
    }
    console.log(`App: ${instrumentId}가 선택되었습니다. 게임을 시작합니다.`);
    setSelectedInstrument(instrumentId);
  };

  return (
    <div className="App">
      {/* 
        selectedInstrument가 null이면(아직 선택 안 함) -> 악기 선택 컴포넌트를 보여주고,
        null이 아니면(선택 완료) -> PhaserGame 컴포넌트를 보여줍니다.
      */}
      {selectedInstrument ? (
        <PhaserGame instrument={selectedInstrument} />
      ) : (
        <InstrumentSelectionComponent onInstrumentSelect={handleInstrumentSelect} />
      )}
    </div>
  );
}

export default App;