import React from 'react';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#282c34',
    color: 'white',
  },
  title: {
    fontSize: '32px',
    marginBottom: '40px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  button: {
    fontSize: '28px',
    color: '#00ff00',
    backgroundColor: '#333333',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    minWidth: '250px',
    textAlign: 'center',
  }
};

const instruments = [
  { id: 'electric_guitar', name: '일렉기타' },
  { id: 'bass', name: '베이스' },
  { id: 'drums', name: '드럼' },
  { id: 'keyboard', name: '키보드' },
  { id: 'vocal', name: '보컬' }
];

// 부모 컴포넌트로부터 onInstrumentSelect 함수를 props로 받습니다.
export default function InstrumentSelectionComponent({ onInstrumentSelect }) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>연주할 악기를 선택하세요</h1>
      <div style={styles.buttonContainer}>
        {instruments.map(instrument => (
          <button
            key={instrument.id}
            style={styles.button}
            onClick={() => onInstrumentSelect(instrument.id)}
          >
            {instrument.name}
          </button>
        ))}
      </div>
    </div>
  );
} 