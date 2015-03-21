class Emulator {
  constructor(){
    this.load()
    this.chip8 = new Chip8();
    this.cvs = document.getElementById("canvas");
    this.ctx = this.cvs.getContext("2d");
    this.cvs.width = 640;
    this.cvs.height = 320;
    this.paletteList = [  ["#000000","#FFFFFF"],
                          ["#665178","#A9CDC3"],
                          ["#4D5E5F","#F84934"],
                          ["#1493A5","#F1EADC"],
                          ["#003A54","#325D6F"]
    ];
    this.n = 0;
    this.palette = Math.round(Math.random() * (this.paletteList.length - 1));
  }
  load(){
    var xhr = new XMLHttpRequest;
    xhr.open("GET", "roms/invaders", true);
    xhr.responseType = "arraybuffer";

    xhr.onload = () => {
      var game = new Uint8Array(xhr.response);
      this.chip8.reset();
      this.chip8.loadGame(game);
      this.loop();
    };

    xhr.send();
  }
  loop(){

    setTimeout(()=> {
      if(this.n > -1){
        for(var i = 0; i < 1; i++)
          this.chip8.emulateCycle();
        // updateRegistersDisplay();
        // updateMemoryDisplay();
        // updateOthers();
        if(this.chip8.draw){
          this.ctx.fillStyle = this.paletteList[this.palette][0];
          this.ctx.fillRect(0, 0, 640, 320);
          this.ctx.fillStyle = this.paletteList[this.palette][1];
          for(var x = 0; x < 64; x++){
            for(var y = 0; y < 32; y++){
              if(this.chip8.screen[x + (y * 64)])
                this.ctx.fillRect(x * 10, y * 10, 10, 10);
            }
          }
          this.chip8.draw = false;
        }
        this.n++;
      }
      window.requestAnimationFrame(() => {this.loop()});
    },100);
  }
}