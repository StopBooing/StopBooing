import * as Tone from 'tone';
import BaseInstrument from './BaseInstrument.js';

export default class Piano extends BaseInstrument {
  constructor(scene) {
    super(scene);
    this.instrument = null; // Tone.Sampler 인스턴스를 저장합니다.
    this.isLoaded = false;
  }

  createUI() {
    this.scene.loadingText = this.scene.add.text(400, 300, "피아노 로딩 중...", { fontSize: '20px' }).setOrigin(0.5);
    this.loadSamples();
  }

  loadSamples() {
    const pianoNotes = {
      'C4': 'C4.mp3', 'E4': 'E4.mp3', 'G4': 'G4.mp3', 'F4': 'F4.mp3', 'A4': 'A4.mp3',
      'C5': 'C5.mp3', 'E5': 'E5.mp3', 'D4': 'D4.mp3', 'D5': 'D5.mp3', 'A5': 'A5.mp3',
      'Ab4': 'Ab4.mp3', 'B3': 'B3.mp3', 'B4': 'B4.mp3'
    };

    this.instrument = new Tone.Sampler({
      urls: pianoNotes,
      baseUrl: 'assets/acoustic_grand_piano-mp3/',
      release: 1, // 소리가 멈추는 시간을 1초에서 0.1초로 줄여 즉시 반응하는 것처럼 만듭니다.
      onload: () => {
        console.log('피아노 샘플이 성공적으로 로드되었습니다.');
        this.isLoaded = true;
        if (this.scene.loadingText) {
          this.scene.loadingText.destroy();
        }
        // this.scene.add.text(400, 450, "피아노 연주 준비 완료!", { fontSize: '20px' }).setOrigin(0.5);
        this.scene.startCountdown();
      },
      onerror: (error) => {
        console.error("피아노 샘플 로드 오류:", error);
      }
    }).toDestination();
  }
} 