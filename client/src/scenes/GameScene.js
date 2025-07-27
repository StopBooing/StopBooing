import Phaser from 'phaser';
import socket from '../services/socket';
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
    

    this.input.keyboard.on('keydown',(event)=>{
        socket.emit('HITfromCLIENT',{key: event.key, code: event.code, time :Date.now()})
    });
    this.input.keyboard.on('keydown-1',(event)=>{
        socket.emit('ACCURACYfromCLIENT',{key: event.key, code: event.code, time :Date.now()})
    });
    


    socket.on('HITfromSERVER',(data)=>{
        console.log('HITfromSERVER',data);
    });
    // 초기화: 아무것도 그리지 않음
  }

  update() {
    // 초기화: 아무것도 하지 않음
  }

  handleSpace() {
    // 초기화: 아무것도 하지 않음
  }
}