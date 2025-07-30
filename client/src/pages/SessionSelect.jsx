import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';

// 상수들을 컴포넌트 외부로 분리
const INSTRUMENTS = [
  { id: 'vocal', name: '보컬', icon: '🎤', color: '#e91e63' },
  { id: 'keyboard', name: '키보드', icon: '🎹', color: '#2196f3' },
  { id: 'drum', name: '드럼', icon: '🥁', color: '#ff9800' },
  { id: 'guitar', name: '기타', icon: '🎸', color: '#4caf50' }
];

// 스타일 상수
const STYLES = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    background: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Noto Serif KR', 'serif'",
    position: 'relative',
    overflow: 'hidden'
  },
  mainCard: {
    background: '#ffffff',
    borderRadius: 24,
    boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
    padding: '48px 36px 36px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 400,
    maxWidth: 600,
    border: '1px solid rgba(0,0,0,0.06)',
    zIndex: 1,
    position: 'relative'
  },
  title: {
    color: '#212529',
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: 4,
    marginBottom: 32,
    textShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  description: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 1.6,
    maxWidth: 400
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 20,
    width: '100%',
    marginBottom: 32
  }
};

export default function SessionSelect({ setSession }) {
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState({});
  const [myPlayerId, setMyPlayerId] = useState(null);
  const navigate = useNavigate();

  // 소켓 이벤트 핸들러들을 useCallback으로 메모이제이션
  const handleInstrumentSelected = useCallback((data) => {
    console.log('악기 선택됨:', data);
    setSelectedInstruments(data.selectedInstruments);
  }, []);

  const handleInstrumentDeselected = useCallback((data) => {
    console.log('악기 선택 해제됨:', data);
    setSelectedInstruments(data.selectedInstruments);
  }, []);

  const handleInstrumentAlreadyTaken = useCallback((instrument) => {
    console.log(`악기 ${instrument}는 이미 선택되었습니다.`);
    alert(`죄송합니다. ${instrument}는 이미 다른 플레이어가 선택했습니다.`);
  }, []);

  useEffect(() => {
    console.log('SessionSelect useEffect 실행, socket.id:', socket.id);
    setMyPlayerId(socket.id);

    socket.on('instrument_selected', handleInstrumentSelected);
    socket.on('instrument_deselected', handleInstrumentDeselected);
    socket.on('instrument_already_taken', handleInstrumentAlreadyTaken);

    return () => {
      socket.off('instrument_selected', handleInstrumentSelected);
      socket.off('instrument_deselected', handleInstrumentDeselected);
      socket.off('instrument_already_taken', handleInstrumentAlreadyTaken);
    };
  }, [handleInstrumentSelected, handleInstrumentDeselected, handleInstrumentAlreadyTaken]);

  // 악기 선택/해제 핸들러를 useCallback으로 메모이제이션
  const handleSessionSelect = useCallback((session) => {
    if (selectedInstruments[session]) {
      return;
    }
    socket.emit('select_instrument', session);
    setSelectedSession(session);
  }, [selectedInstruments, myPlayerId]);

  const handleSessionDeselect = useCallback(() => {
    console.log('handleSessionDeselect 호출:', selectedSession);
    if (selectedSession) {
      socket.emit('deselect_instrument', selectedSession);
      setSelectedSession('');
    }
  }, [selectedSession]);

  const handleNext = useCallback(() => {
    if (!selectedSession) return;
    setSession(selectedSession);
    navigate(`/game/${selectedSession}`);
  }, [selectedSession, setSession, navigate]);

  // 악기 상태 계산을 useMemo로 메모이제이션
  const instrumentStates = useMemo(() => {
    console.log('instrumentStates 계산 중...');
    console.log('selectedInstruments:', selectedInstruments);
    console.log('myPlayerId:', myPlayerId);
    
    return INSTRUMENTS.map(instrument => {
      const isSelected = selectedInstruments[instrument.id] === myPlayerId;
      const isDisabled = selectedInstruments[instrument.id] && !isSelected;
      
      console.log(`악기 ${instrument.id}: isSelected=${isSelected}, isDisabled=${isDisabled}`);
      
      return {
        ...instrument,
        isSelected,
        isDisabled
      };
    });
  }, [selectedInstruments, myPlayerId]);

  // 버튼 스타일 계산을 useMemo로 메모이제이션
  const getButtonStyle = useCallback((instrument) => {
    const baseStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      borderRadius: 20,
      transition: 'all 0.3s ease',
      fontFamily: "'Noto Serif KR', 'serif'",
      outline: 'none',
      minHeight: 120,
      position: 'relative'
    };

    if (instrument.isSelected) {
      return {
        ...baseStyle,
        border: `3px solid ${instrument.color}`,
        background: `${instrument.color}15`,
        color: instrument.color,
        boxShadow: `0 8px 24px ${instrument.color}30`,
        cursor: 'pointer'
      };
    }

    if (instrument.isDisabled) {
      return {
        ...baseStyle,
        border: '2px solid #dee2e6',
        background: '#f8f9fa',
        color: '#adb5bd',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        cursor: 'not-allowed',
        opacity: 0.6
      };
    }

    return {
      ...baseStyle,
      border: '2px solid #e9ecef',
      background: '#ffffff',
      color: '#6c757d',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      cursor: 'pointer'
    };
  }, []);

  // 이벤트 핸들러들을 useCallback으로 메모이제이션
  const handleButtonClick = useCallback((instrument) => {
    if (instrument.isDisabled) return;
    
    if (instrument.isSelected) {
      handleSessionDeselect();
    } else {
      handleSessionSelect(instrument.id);
    }
  }, [handleSessionSelect, handleSessionDeselect]);

  const handleButtonMouseEnter = useCallback((e, instrument) => {
    if (!instrument.isDisabled && !instrument.isSelected) {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
    }
  }, []);

  const handleButtonMouseLeave = useCallback((e, instrument) => {
    if (!instrument.isDisabled && !instrument.isSelected) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
    }
  }, []);

  const handleButtonMouseDown = useCallback((e, instrument) => {
    if (!instrument.isDisabled) {
      e.currentTarget.style.transform = 'translateY(-2px) scale(0.98)';
    }
  }, []);

  const handleButtonMouseUp = useCallback((e, instrument) => {
    if (!instrument.isDisabled) {
      if (instrument.isSelected) {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
      } else {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1)';
      }
    }
  }, []);

  return (
    <div style={STYLES.container}>
      {/* 배경 장식 요소들 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #e9ecef 0%, #f8f9fa 70%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #dee2e6 0%, #f8f9fa 60%)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* 메인 컨테이너 */}
      <div style={STYLES.mainCard}>
        {/* 타이틀 */}
        <h2 style={STYLES.title}>악기 선택</h2>

        {/* 설명 텍스트 */}
        <p style={STYLES.description}>
          플레이할 악기를 선택해주세요<br />
          각 악기는 고유한 역할과 난이도를 가지고 있습니다
        </p>

        {/* 악기 선택 버튼들 */}
        <div style={STYLES.buttonGrid}>
          {instrumentStates.map((instrument) => (
            <button
              key={instrument.id}
              onClick={() => handleButtonClick(instrument)}
              disabled={instrument.isDisabled}
              style={getButtonStyle(instrument)}
              onMouseEnter={(e) => handleButtonMouseEnter(e, instrument)}
              onMouseLeave={(e) => handleButtonMouseLeave(e, instrument)}
              onMouseDown={(e) => handleButtonMouseDown(e, instrument)}
              onMouseUp={(e) => handleButtonMouseUp(e, instrument)}
            >
              {/* 아이콘 */}
              <div style={{
                fontSize: 48,
                marginBottom: 12,
                filter: instrument.isSelected ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none',
                opacity: instrument.isDisabled ? 0.5 : 1
              }}>
                {instrument.icon}
              </div>
              
              {/* 악기 이름 */}
              <div style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 1
              }}>
                {instrument.name}
              </div>

              {/* 선택 표시 */}
              {instrument.isSelected && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: instrument.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}

              {/* 다른 플레이어가 선택한 경우 표시 */}
              {instrument.isDisabled && !instrument.isSelected && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}>
                  👤
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleNext}
          disabled={!selectedSession}
          style={{
            fontSize: 20,
            fontWeight: 600,
            padding: '16px 48px',
            borderRadius: 24,
            border: '2px solid #007bff',
            background: selectedSession ? '#007bff' : '#e9ecef',
            color: selectedSession ? '#ffffff' : '#6c757d',
            boxShadow: selectedSession ? '0 4px 16px rgba(0,123,255,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            cursor: selectedSession ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            fontFamily: "'Noto Serif KR', 'serif'",
            outline: 'none'
          }}
          onMouseDown={e => {
            if (selectedSession) {
              e.currentTarget.style.transform = 'scale(0.97)';
            }
          }}
          onMouseUp={e => {
            if (selectedSession) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
          onMouseEnter={e => {
            if (selectedSession) {
              e.currentTarget.style.background = '#0056b3';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,123,255,0.4)';
            }
          }}
          onMouseLeave={e => {
            if (selectedSession) {
              e.currentTarget.style.background = '#007bff';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,123,255,0.3)';
            }
          }}
        >
          게임 시작
        </button>

        {/* 하단 안내 텍스트 */}
        <p style={{
          color: '#adb5bd',
          fontSize: 14,
          marginTop: 24,
          textAlign: 'center',
          lineHeight: 1.4
        }}>
          선택한 악기로 리듬게임을 플레이합니다
        </p>
      </div>

      {/* 하단 장식 */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        color: '#6c757d',
        fontSize: 16,
        letterSpacing: 2,
        zIndex: 1
      }}>
        Instrument Selection
      </div>
    </div>
  );
} 