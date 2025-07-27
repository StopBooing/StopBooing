import * as Tone from 'tone';
import BaseInstrument from './BaseInstrument.js';

export default class ElectricGuitar extends BaseInstrument {
  constructor(scene) {
    super(scene);
    this.instrument = null;
    this.isLoaded = false;
  }

  createUI() {
    this.scene.add.text(400, 50, '일렉기타 연주 화면', { fontSize: '32px' }).setOrigin(0.5);
    this.scene.loadingText = this.scene.add.text(400, 300, "일렉기타 로딩 중...", { fontSize: '20px' }).setOrigin(0.5);
    this.loadSamples();
  }

  loadSamples() {
    const guitarNotes = {
      'C3': 'C3.mp3',
      'E3': 'E3.mp3',
      'F3': 'F3.mp3',
      'G3': 'G3.mp3',
      'A#3': 'Bb3.mp3',  // B♭3
      'E4': 'E4.mp3',
      'F#4': 'Gb4.mp3',
    };

    this.instrument = new Tone.Sampler({
      urls: guitarNotes,
      baseUrl: 'assets/distortion_guitar-mp3/',
      release: 1,
      onload: () => {
        console.log('일렉기타 샘플 로드 완료');
        this.isLoaded = true;
        this.scene.loadingText.destroy();
        this.scene.add.text(400, 450, "일렉기타 준비 완료!", { fontSize: '20px' }).setOrigin(0.5);
        this._setupIntroPart();
      }
    }).toDestination();
  }

  _setupIntroPart() {
    // 1마디 = 1:0:0, 2마디 = 1:0:0 ... 0-based 기준이니 3번째 마디는 "2:0:0"
    const events = [
      // --- 1,2마디: 휴지 ---
      // --- 3마디 (measure 2) ---
      ["2:0:0", { note: "C3",  duration: "8n" }],  // 5번 줄 3프렛
      ["2:0:1", { note: "E3",  duration: "8n" }],  // 4번 줄 2프렛
      ["2:0:2", { note: "F3",  duration: "8n" }],  // 4번 줄 3프렛
      ["2:0:3", { note: "G3",  duration: "4n" }],  // 3번 줄 0프렛
      ["2:1:0", { note: "A#3", duration: "4n" }],  // 3번 줄 3프렛

      // --- 4마디 (measure 3) ---
      // 첫째 박: (2번 줄 벤드 5→7)이펙트라면 간단히 한 음으로
      // ["3:0:0", { note: "E4", duration: "2n" }],  // B3@5프렛 → 벤드 E4 정도로
      // // 나머지 리프
      // ["3:1:0", { note: "E4",  duration: "8n" }],
      // ["3:1:1", { note: "E4",  duration: "8n" }],
      // ["3:1:2", { note: "F#4", duration: "8n" }],
      // ["3:1:3", { note: "E4",  duration: "8n" }],
      // // 끝마디 마무리
      // ["3:2:0", { note: "G3",  duration: "4n" }],  // 3번 줄 0프렛
    ];

    // Tone.Part 생성
    const guitarIntro = new Tone.Part((time, { note, duration }) => {
      this.instrument.triggerAttackRelease(note, duration, time);
    }, events);

    guitarIntro.start(0);
    Tone.Transport.bpm.value = 100;    // 원곡 BPM에 맞춰 조정
    Tone.Transport.start("+0.1");      // 약간의 딜레이 후 시작
  }
}
