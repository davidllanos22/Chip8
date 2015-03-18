class Emulator {
  constructor(){
    this.load()
    this.chip8 = new Chip8();
  }
  load(){
    var xhr = new XMLHttpRequest;
    xhr.open("GET", "roms/pong", true);
    xhr.responseType = "arraybuffer";

    xhr.onload = () => {
      var game = new Uint8Array(xhr.response);
      this.chip8.loadGame(game);
      this.loop();
    };

    xhr.send();
  }
  loop(){

    this.chip8.emulateCycle();

    window.requestAnimationFrame(() => {this.loop()});
  }
}

var e = new Emulator();