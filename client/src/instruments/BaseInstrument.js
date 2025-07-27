/**
 * 모든 악기 컨트롤러의 기본 설계도 역할을 하는 기본 클래스입니다.
 * 각 악기 클래스는 이 클래스를 상속받아 자신만의 로직을 구현해야 합니다.
 */
export default class BaseInstrument {
  /**
   * @param {Phaser.Scene} scene - 악기가 속한 Phaser 씬
   */
  constructor(scene) {
    if (this.constructor === BaseInstrument) {
      throw new TypeError('추상 클래스 "BaseInstrument"는 직접 인스턴스화할 수 없습니다.');
    }
    this.scene = scene;
    this.instrument = null; // Tone.js Sampler 또는 Synth 인스턴스
    this.isLoaded = false;  // 악기 사운드 로딩 완료 여부
  }

  /**
   * 악기별 UI 요소를 생성합니다. (예: 악기 이미지, 로딩 텍스트)
   * 이 메서드는 각 악기 클래스에서 반드시 구현해야 합니다.
   */
  createUI() {
    throw new Error('createUI() 메서드는 하위 클래스에서 구현해야 합니다.');
  }

  /**
   * 악기에 필요한 사운드 샘플을 로드합니다.
   * 이 메서드는 각 악기 클래스에서 반드시 구현해야 합니다.
   */
  loadSamples() {
    throw new Error('loadSamples() 메서드는 하위 클래스에서 구현해야 합니다.');
  }

  /**
   * 키보드 'keydown' 이벤트가 발생했을 때 호출될 함수입니다.
   * @param {string[]} chord - 연주할 음(코드) 배열 (예: ['C4', 'E4'])
   */
  handleAttack(chord) {
    if (!this.isLoaded || !this.instrument) return;
    this.instrument.triggerAttack(chord);
  }

  /**
   * 키보드 'keyup' 이벤트가 발생했을 때 호출될 함수입니다.
   * @param {string[]} chord - 멈출 음(코드) 배열
   */
  handleRelease(chord) {
    if (!this.isLoaded || !this.instrument) return;
    this.instrument.triggerRelease(chord);
  }
} 