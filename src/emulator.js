class Emulator {
  constructor(){
    this.chip8 = new Chip8();
    this.loop();
  }
  loop(){

    this.chip8.emulateCycle();

    window.requestAnimationFrame(() => {this.loop()});
  }
}

var e = new Emulator();