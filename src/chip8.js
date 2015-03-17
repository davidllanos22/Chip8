class Chip8 {
  constructor(){
    this.reset();
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

    this.memory[0x200] = 0xA2; // TODO: REMOVE
    this.memory[0x201] = 0xF0;
  }

  emulateCycle(){
    this.opcode = this.memory[this.PC] << 8 | this.memory[this.PC + 1];

    switch(this.opcode & 0xF000){ // We just need the first 4 bits.
      case 0x0000:
        switch(this.opcode & 0xF000){
          case 0x00E0: // 00E0 | CLS | Clear the Display.
            this.clearDisplay();
            break;
          case 0x00EE: // 00EE | RET | Return from a subroutine.
            this.PC = this.stack[this.SP--];
            break;
        }
        break;
      case 0x1000: // 1nnn | JP addr | Jump to location nnn.
        this.PC = this.opcode & 0x0FFF;
        break;
      case 0x2000: // 2nnn | CALL addr | Call subroutine at nnn.
        this.SP++;
        this.stack[this.SP] = this.PC;
        this.PC = this.opcode & 0x0FFF;
        break;
      case 0x3000: // 3xkk | SE Vx, byte | Skip next instruction if Vx == kk.
        if(this.V[this.opcode & 0x0F00] == this.opcode & 0x00FF)
          this.PC +=2;
        break;
      case 0x4000: // 4xkk | SNE Vx, byte | Skip next instruction if Vx != kk.
        if(this.V[this.opcode & 0x0F00] != this.opcode & 0x00FF)
          this.PC +=2;
        break;
      case 0x5000: // 5xy0 | SE Vx, Vy | Skip next instructions if Vx == Vy.
        if(this.V[this.opcode & 0x0F00] == this.V[this.opcode & 0x00F0])
          this.PC +=2;
        break;
      case 0x6000: // 6xkk | LD Vx, byte | Vx = kk.
        this.V[this.opcode & 0x0F00] = this.opcode & 0x00FF;
        break;
      case 0x7000: // 7xkk | ADD Vx, byte | Vx = Vx + kk.
        this.V[this.opcode & 0x0F00] += this.opcode & 0x00FF;
        break;
      case 0x8000:
        switch(this.opcode & 0x000F){
          case 0x0000: // 8xy0 | LD Vx, Vy | Vx = Vy.
            this.V[this.opcode & 0x0F00] = this.V[this.opcode & 0x00F0];
            break;
          case 0x0001: // 8xy1 | OR Vx, Vy | Vx = Vx or Vy.
            this.V[this.opcode & 0x0F00] |= this.V[this.opcode & 0x00F0];
            break;
          case 0x0002: // 8xy2 | AND Vx, Vy | Vx = Vx and Vy.
            this.V[this.opcode & 0x0F00] &= this.V[this.opcode & 0x00F0];
            break;
          case 0x0003: // 8xy3 | XOR Vx, Vy | Vx = Vx xor Vy.
            this.V[this.opcode & 0x0F00] ^= this.V[this.opcode & 0x00F0];
            break;
          case 0x0004: // 8xy4 | ADD Vx, Vy | Vx = Vx + Vy.
            this.V[this.opcode & 0x0F00] += this.V[this.opcode & 0x00F0];
            this.V[0xF] = this.V[this.opcode & 0x0F00] > 0xFF ? 1 : 0;
            if(this.V[0xF] == 1)
              this.V[this.opcode & 0x0F00] -= 255;
            break;
          case 0x0005: // 8xy5 | SUB Vx, Vy | Vx = Vx - Vy.
            this.V[0xF] = this.V[this.opcode & 0x0F00] > this.V[this.opcode & 0x00F0] ? 1 : 0;
            this.V[this.opcode & 0x0F00] -= this.V[this.opcode & 0x00F0];
            if(this.V[0xF] == 0)
              this.V[this.opcode & 0x0F00] += 255;
            break;
          case 0x0006: // 8xy6 | SHR Vx {, Vy} | Vx = Vx SHR 1. 
            //------------------
            this.V[0xF] = this.V[this.opcode & 0x0F00] & 0x1;
            this.V[this.opcode & 0x0F00] -= this.V[this.opcode & 0x00F0];
            break;
        }
        break;
      case 0xA000:
        this.I = this.opcode & 0x0FFF;
        this.PC += 2;
        console.log(Utils.toHex(this.opcode));
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