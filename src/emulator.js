class Emulator {
  constructor(){
    this.load()
    this.chip8 = new Chip8();
    this.cvs = document.getElementById("canvas");
    this.ctx = this.cvs.getContext("2d");
    this.cvs.width = 64;
    this.cvs.height = 32;
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

    setTimeout(()=> {
      this.chip8.emulateCycle();
      updateRegistersDisplay();
      this.ctx.fillStyle = "#222222";
      this.ctx.fillRect(0, 0, 64, 32);
      this.ctx.fillStyle = "#444444";
      for(var x = 0; x < 64; x++){
        for(var y = 0; y < 32; y++){
          if(this.chip8.screen[x + (y * 64)])
            this.ctx.fillRect(x * 10, y * 10, 10, 10);
        }
      }

      window.requestAnimationFrame(() => {this.loop()});
    },100);
  }
}