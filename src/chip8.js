class Chip8 {
  constructor(){
    this.debug = true;
    this.reset();
  }
  loadGame(game){
    for(var i = 0; i < game.byteLength; i++)
      this.memory[i + 0x200] = game[i];
  }
  reset(){
    var i, chars = [  0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
                      0x20, 0x60, 0x20, 0x20, 0x70, // 1
                      0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
                      0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
                      0x90, 0x90, 0xF0, 0x10, 0x10, // 4
                      0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
                      0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
                      0xF0, 0x10, 0x20, 0x40, 0x40, // 7
                      0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
                      0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
                      0xF0, 0x90, 0xF0, 0x90, 0x90, // A
                      0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
                      0xF0, 0x80, 0x80, 0x80, 0xF0, // C
                      0xE0, 0x90, 0x90, 0x90, 0xE0, // D
                      0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
                      0xF0, 0x80, 0xF0, 0x80, 0x80  // F
    ];

    this.opcode = 0x0; // Operation Code.

    this.memory = new Array(4096); // Memory Addresses.
    for(i = 0; i < this.memory.length; i++)
      this.memory[i] = 0x0;

    for (i = 0; i < chars.length; i++)
      this.memory[i] = chars[i];

    this.V = new Array(16); // Registers.
    for(i = 0; i < this.V.length; i++)
      this.V[i] = 0x0;

    this.I = 0x0; // Index Register.
    this.PC = 0x200; // Program Counter.

    this.screen = new Array(64 * 32); // Pixels array.
    this.clearDisplay();

    this.delayTimer = 0x0;
    this.soundTimer = 0x0;

    this.stack = new Array(16);
    for(i = 0; i < this.stack.length; i++)
      this.stack[i] = 0x0;

    this.SP = 0x0; // Stack Pointer.

    this.key = new Array(16); // Keys state array.
    for(i = 0; i < this.key.length; i++)
      this.key[0] = 0x0;
  }

  emulateCycle(){
    this.opcode = this.memory[this.PC] << 8 | this.memory[this.PC + 1];
    var x = (this.opcode & 0x0F00) >> 8;
    var y = (this.opcode & 0x00F0) >> 4;

    switch(this.opcode & 0xF000){ // We just need the first 4 bits.
      case 0x0000:
        switch(this.opcode & 0xF000){
          case 0x00E0: // 00E0 | CLS | Clear the Display.
            this.clearDisplay();
            if(this.debug) console.log(Utils.toHex(this.opcode) + " CLS");
            break;
          case 0x00EE: // 00EE | RET | Return from a subroutine.
            this.PC = this.stack[this.SP--];
            if(this.debug) console.log(Utils.toHex(this.opcode) + " RET");
            break;
        }
        break;
      case 0x1000: // 1nnn | JP addr | Jump to location nnn.
        this.PC = this.opcode & 0x0FFF;
        if(this.debug) console.log(Utils.toHex(this.opcode) + " JP addr");
        break;
      case 0x2000: // 2nnn | CALL addr | Call subroutine at nnn.
        this.SP++;
        this.stack[this.SP] = this.PC;
        this.PC = this.opcode & 0x0FFF;
        if(this.debug) console.log(Utils.toHex(this.opcode) + " CALL addr");
        break;
      case 0x3000: // 3xkk | SE Vx, byte | Skip next instruction if Vx == kk.
        if(this.V[this.opcode & 0x0F00] == this.opcode & 0x00FF)
          this.PC += 2;
        if(this.debug) console.log(Utils.toHex(this.opcode) + " SE Vx, byte");
        break;
      case 0x4000: // 4xkk | SNE Vx, byte | Skip next instruction if Vx != kk.
        if(this.V[x] != this.opcode & 0x00FF)
          this.PC += 2;
        if(this.debug) console.log(Utils.toHex(this.opcode) + " SNE Vx, byte");
        break;
      case 0x5000: // 5xy0 | SE Vx, Vy | Skip next instructions if Vx == Vy.
        if(this.V[x] == this.V[y])
          this.PC += 2;
        if(this.debug) console.log(Utils.toHex(this.opcode) + " SE Vx, Vy");
        break;
      case 0x6000: // 6xkk | LD Vx, byte | Set Vx = kk.
        this.V[x] = this.opcode & 0x00FF;
        if(this.debug) console.log(Utils.toHex(this.opcode) + " LD Vx, byte");
        break;
      case 0x7000: // 7xkk | ADD Vx, byte | Set Vx = Vx + kk.
        this.V[x] += this.opcode & 0x00FF;
        if(this.debug) console.log(Utils.toHex(this.opcode) + " ADD Vx, byte");
        break;
      case 0x8000:
        switch(this.opcode & 0x000F){
          case 0x0000: // 8xy0 | LD Vx, Vy | Set Vx = Vy.
            this.V[x] = this.V[y];
            if(this.debug) console.log(Utils.toHex(this.opcode) + " LD Vx, Vy");
            break;
          case 0x0001: // 8xy1 | OR Vx, Vy | Set Vx = Vx OR Vy.
            this.V[x] |= this.V[y];
            if(this.debug) console.log(Utils.toHex(this.opcode) + " OR Vx, Vy");
            break;
          case 0x0002: // 8xy2 | AND Vx, Vy | Set Vx = Vx AND Vy.
            this.V[x] &= this.V[y];
            if(this.debug) console.log(Utils.toHex(this.opcode) + " AND Vx, Vy");
            break;
          case 0x0003: // 8xy3 | XOR Vx, Vy | Set Vx = Vx XOR Vy.
            this.V[x] ^= this.V[y];
            if(this.debug) console.log(Utils.toHex(this.opcode) + " XOR Vx, Vy");
            break;
          case 0x0004: // 8xy4 | ADD Vx, Vy | Set Vx = Vx + Vy.
            this.V[x] += this.V[y];
            this.V[0xF] = this.V[x] > 0xFF ? 1 : 0;
            if(this.V[0xF] == 1)
              this.V[x] -= 255;
            if(this.debug) console.log(Utils.toHex(this.opcode) + " ADD Vx, Vy");
            break;
          case 0x0005: // 8xy5 | SUB Vx, Vy | Vx = Vx - Vy.
            this.V[0xF] = this.V[x] > this.V[y] ? 1 : 0;
            this.V[x] -= this.V[y];
            if(this.V[0xF] == 0)
              this.V[x] += 255;
            if(this.debug) console.log(Utils.toHex(this.opcode) + " SUB Vx, Vy");
            break;
          case 0x0006: // 8xy6 | SHR Vx {, Vy} | Vx = Vx SHR 1. 
            this.V[0xF] = this.V[x] & 0x1;
            this.V[x] >>= 1;
            if(this.debug) console.log(Utils.toHex(this.opcode) + " SHR Vx {, Vy}");
            break;
          case 0x0007: // 8xy7 | SUBN Vx, Vy | Vx = Vy - Vx. 
            this.V[0xF] = this.V[y] > this.V[x] ? 1 : 0;
            this.V[x] = this.V[y] - this.V[x];
            if(this.V[0xF] == 0)
              this.V[x] += 255;
            if(this.debug) console.log(Utils.toHex(this.opcode) + " SUBN Vx, Vy");
            break;
          case 0x00E: // 8xyE | SHL Vx {, Vy} | Vx = vX SHL 1.
            this.V[0xF] = this.V[x] & 0x1;
            this.V[x] <<= 1;
            if(this.V[x] > 255) this.V[x] -= 255;
            if(this.debug) console.log(Utils.toHex(this.opcode) + " SHL Vx {, Vy}");
            break;
        }
        break;
      case 0x9000: // 9xy0 | SNE Vx, Vy | Skip bext instruction if Vx != Vy.
        if(this.V[x] != this.V[y])
          this.PC += 2;
        if(this.debug) console.log(Utils.toHex(this.opcode) + " SNE Vx, Vy");
        break;
      case 0xA000: // Annn | LD I, addr | Set I = nnn.
        this.I = this.opcode & 0x0FFF;
        this.PC += 2;
        if(this.debug) console.log(Utils.toHex(this.opcode) + " LD I, addr");
        break;
      case 0xB000: // Bnnn | JP V0, addr | Jump to location nnn + V0.
        this.PC = (this.opcode & 0x0FFF) + this.V[0x0]; 
        if(this.debug) console.log(Utils.toHex(this.opcode) + " JP V0, addr");
        break;
      case 0xC000: // Cxkk | RND Vx, byte | Set Vx = random byte AND kk.
        this.V[x] = Math.floor(Math.random() * 0xFF) & (this.opcode & 0x00FF);
        if(this.debug) console.log(Utils.toHex(this.opcode) + " RND Vx, byte");
        break;
      case 0xD000: // Dxyn | DRW Vx, Vy, nibble | Display sprite and set VF = collision.
        var n = this.opcode & 0x000F;
        var ax = this.V[x];
        var ay = this.V[y];

        for(var i = 0; i < n; i++){
          var pixel = this.memory[this.I + i];
          for(var j = 0; j < 8; j++){
            if((pixel & (0x80 >> i)) != 0){
              var px = ax + j;
              var py = ay + i;

              if(py >= 64) py-= 64;
              if(py < 0) py += 64;
              if(py >= 32) py-= 32;
              if(py < 0) py += 32;
              
            
              if(this.screen[px + (py * 64)] == 1) // Collision!
                this.V[0xF] = 1;

              this.screen[px + (py * 64)] ^= 1;
            }
          }
        }
        if(this.debug) console.log(Utils.toHex(this.opcode) + " DRW Vx, Vy, nibble");
        break;
      case 0xE000:
        switch(this.opcode & 0x0FFF){
          case 0x009E: // Ex9E | SKP Vx | Skip next instruction if key Vx is pressed.
            if(this.key[this.V[x]] != 0)
              this.PC += 2;
            if(this.debug) console.log(Utils.toHex(this.opcode) + " SKP Vx");
            break;
          case 0x00A1: // ExA1 | SKNP Vx | Skip next instruction if key Vx is not pressed.
            if(this.key[this.V[x]] == 0)
              this.PC += 2;
            if(this.debug) console.log(Utils.toHex(this.opcode) + " SKNP Vx");
            break;
        }
        break;
      case 0xF000:
        switch(this.opcode & 0x00FF){
          case 0x0007: // Fx07 | LD Vx, DT | Set Vx = Delay Timer.
            this.V[x] = this.delayTimer;
            if(this.debug) console.log(Utils.toHex(this.opcode) + " LD Vx, DT");
            break;
          case 0x000A: // Fx0A | LD Vx, K | Wait for a key press. Set Vx = K.
            if(this.currentKey)
              this.key[this.V[x]] = this.currentKey;
            this.V[x] = this.delayTimer;
            if(this.debug) console.log(Utils.toHex(this.opcode) + " LD Vx, K");
            break;
          case 0x0015: // Fx15 | LD DT, Vx | Set DT = Vx.
            this.delayTimer = this.V[x];
            if(this.debug) console.log(Utils.toHex(this.opcode) + " LD DT, Vx");
            break;
          case 0x0018: // Fx18 | LD ST, Vx | Set ST = Vx.
            this.soundTimer = this.V[x];
            if(this.debug) console.log(Utils.toHex(this.opcode) + " LD ST, Vx");
            break;
          case 0x001E: // Fx1E | ADD I, Vx | Set I = I + Vx.
            this.I += this.V[x];
            if(this.debug) console.log(Utils.toHex(this.opcode) + " ADD I, Vx");
            break;
          case 0x0029: // Fx29 | LD F, Vx | Set I = location of sprite for digit Vx.
            this.I = this.V[x] * 0x5;
            if(this.debug) console.log(Utils.toHex(this.opcode) + " LD F, Vx");
            break;
          case 0x0033: // Fx33 | LD B, Vx | Store BCD of Vx in I, I+1 and I+2.
            this.memory[this.I]     = parseInt(this.V[x] / 100);
            this.memory[this.I + 1] = parseInt(this.V[x] % 100 / 10);
            this.memory[this.I + 2] = parseInt(this.V[x] % 10);
            if(this.debug) console.log(Utils.toHex(this.opcode) + " LD B, Vx");
            break;
          case 0x0055: // Fx55 | LD [I], Vx | Store registers V0 through Vx in memory starting at I.
            for (var i = 0; i <= x; i++)
              this.memory[this.I + i] = this.V[i];
            if(this.debug) console.log(Utils.toHex(this.opcode) + " LD [I], Vx");
            break;
          case 0x0065: // Fx65 | LD Vx, [I] | Read registers V0 through Vx from memory starting at I.
            for (var i = 0; i <= x; i++)
              this.V[i] = this.memory[this.I + i];
            if(this.debug) console.log(Utils.toHex(this.opcode) + " LD Vx, [I]");
            break;
        }
        break;

      default:
        console.log("Unknown opcode: " + Utils.toHex(this.opcode));

    }

    if(this.delayTimer > 0)
      this.delayTimer--;

    if(this.soundTimer > 0){
      if(this.soundTimer == 1)
        console.log("BEEP");
      this.soundTimer--;
    }

    this.PC += 2;
  }

  clearDisplay(){
    for(var i = 0; i < this.screen.length; i++)
      this.screen[i] = 0x0;
  }
}

class Utils {
  static toHex(i){
    return "0x" + (i.toString(16)).toUpperCase();
  }
}