class Chip8 {
  constructor(){
    this.opcode = 0x0; // Operation Code.
    this.memory = new Array(4096); // Memory Addresses.
    this.V = new Array(16); // Registers.
    this.I = 0x0; // Index Register.
    this.PC = 0x0; // Program Counter.
    this.screen = new Array(64 * 32); // Pixels array.
    this.delayTimer = 0x0; //
    this.soundTimer = 0x0; //
    this.stack = new Array(16); //
    this.SP = 0x0; // Stack Pointer.
    this.key = new Array(16); //
  }
  
  reset(){
    var i; 

    this.opcode = 0x0;

    for(i = 0; i < this.memory.length; i++)
      this.memory[i] = 0x0;

    for(i = 0; i < this.V.length; i++)
      this.V[i] = 0x0;

    this.I = 0x0;
    this.PC = 0x200;

    for(i = 0; i < this.screen.length; i++)
      this.screen[i] = 0x0;

    this.delayTimer = 0x0;
    this.soundTimer = 0x0;

    for(i = 0; i < this.stack.length; i++)
      this.stack[i] = 0x0;

    this.SP = 0x0;

    for(i = 0; i < this.key.length; i++)
      this.key[0] = 0x0;
    
  }
}