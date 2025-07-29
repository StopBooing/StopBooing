import * as Tone from 'tone';
import BaseInstrument from './BaseInstrument.js';
import socket from '../services/socket.js';

export default class Drum extends BaseInstrument {
  constructor(scene) {
    super(scene);
    this.instrument = null; // Tone.Sampler 인스턴스를 저장합니다.
    this.isLoaded = false;
  }

  createUI() {
    this.scene.loadingText = this.scene.add.text(400, 300, "드럼 로딩 중...", { fontSize: '20px' }).setOrigin(0.5);
    this.loadSamples();
  }

  loadSamples() {
    // 임시로 기존 피아노 샘플을 사용 (드럼 샘플 파일이 없을 때)
    const drumNotes = {
      'C2': 'kick01rr1.wav',    // 킥 드럼 → C4 (낮은 음)
      'D2': 'snare.wav',    // 스네어 드럼 → E4
      'E2': 'hhopen.wav',    // 하이햇 → G4
      'E3': 'hhclose.wav',    // 하이햇 → G4
      'F2': 'cymbale.wav',    // 크래시 심벌 → F4
      'G2': 'tom1.wav',    // 톰1 → A4
      'A2': 'tom2.wav',    // 톰2 → C5
      'B2': 'tom3.wav',    // 플로어 톰 → E5
      'C3': 'cymbale.wav',    // 라이드 심벌 → D4
    };

    this.instrument = new Tone.Sampler({
      urls: drumNotes,
      baseUrl: 'assets/RealDrum/', // 기존 피아노 샘플 사용
      release: 0.3, // 드럼은 짧은 소리이므로 0.3초로 설정
      onload: () => {
        console.log('드럼 샘플이 성공적으로 로드되었습니다. (피아노 샘플 임시 사용)');
        this.isLoaded = true;
        if (this.scene.loadingText) {
          this.scene.loadingText.destroy();
        }
        // this.scene.add.text(400, 450, "드럼 연주 준비 완료!", { fontSize: '20px' }).setOrigin(0.5);
        this.scene.startCountdown();
      },
      onerror: (error) => {
        console.error("드럼 샘플 로드 오류:", error);
        // 에러 발생 시에도 로딩 완료로 처리하여 게임이 계속 진행되도록 함
        console.log('드럼 샘플 로드 실패, 기본 피아노로 대체합니다.');
        this.isLoaded = true;
        if (this.scene.loadingText) {
          this.scene.loadingText.destroy();
        }
        this.scene.startCountdown();
      }
    }).toDestination();
  }

  handleAttack(notes, key) {
    if (!this.isLoaded) return;
    notes.forEach(note => {
      let velocity = 0.7; // 기본값
      // 각 드럼별로 볼륨 다르게 설정
      if (note === 'C2') velocity = 1.0; // 킥
      else if (note === 'D2') velocity = 0.8; // 스네어
      else if (note === 'E2' || note === 'E3') velocity = 0.4; // 하이햇(오픈/클로즈)
      else if (note === 'F2') velocity = 0.6; // 크래시
      else if (note === 'C3') velocity = 0.5; // 라이드
      else if (note === 'G2' || note === 'A2' || note === 'B2') velocity = 0.7; // 톰류
      this.instrument.triggerAttackRelease(note, '8n', undefined, velocity);
      socket.emit('HITfromCLIENT', { note: note, type: 'drum' });
    });
  }
} 