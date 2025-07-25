import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // 초기화: 아무것도 로드하지 않음
  }

  create() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    this.gameWidth = width;
    this.gameHeight = height;
    const rythmAreaY = 0;
    console.log(rythmAreaY);
    const rythmAreaHeight = height * 0.33;
    const characterAreaY = height * 0.34;
    console.log(characterAreaY);
    const characterAreaHeight = height * 0.66;
    this.add.rectangle(
        0,
        rythmAreaY,
        width,
        rythmAreaHeight,
        0x00ff00
    ).setOrigin(0, 0);
    this.add.rectangle(
        0,
        characterAreaY,
        width,
        characterAreaHeight,
        0x0000ff
    ).setOrigin(0, 0);
    this.add.rectangle(
        width/2,
        characterAreaY+100,
        200,
        200,
        0xff0000
    );
    this.add.rectangle(
        width/2,
        characterAreaY+300,
        200,
        300,
        0xa00000
    );
    // 초기화: 아무것도 그리지 않음
  }

  update() {
    // 초기화: 아무것도 하지 않음
  }

  handleSpace() {
    // 초기화: 아무것도 하지 않음
  }
}