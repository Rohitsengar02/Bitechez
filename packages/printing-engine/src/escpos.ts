export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.initialize();
  }

  initialize(): this {
    this.buffer.push(0x1B, 0x40); // ESC @
    return this;
  }

  align(alignment: 'left' | 'center' | 'right'): this {
    const code = alignment === 'left' ? 0 : alignment === 'center' ? 1 : 2;
    this.buffer.push(0x1B, 0x61, code); // ESC a n
    return this;
  }

  bold(enable: boolean): this {
    this.buffer.push(0x1B, 0x45, enable ? 1 : 0); // ESC E n
    return this;
  }

  doubleSize(enable: boolean): this {
    this.buffer.push(0x1D, 0x21, enable ? 0x11 : 0x00); // GS ! n
    return this;
  }

  text(str: string): this {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      this.buffer.push(code > 127 ? 0x3F : code); // Basic ASCII or ?
    }
    return this;
  }

  line(str = ''): this {
    this.text(str);
    this.buffer.push(0x0A); // LF
    return this;
  }

  divider(width: 32 | 48 = 48, char = '-'): this {
    this.line(char.repeat(width));
    return this;
  }

  twoColumn(left: string, right: string, width: 32 | 48 = 48): this {
    const spaceCount = Math.max(1, width - left.length - right.length);
    this.line(left + ' '.repeat(spaceCount) + right);
    return this;
  }

  feed(lines = 3): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0A);
    }
    return this;
  }

  cut(partial = false): this {
    this.feed(3);
    this.buffer.push(0x1D, 0x56, partial ? 1 : 0); // GS V n
    return this;
  }

  openCashDrawer(): this {
    this.buffer.push(0x1B, 0x70, 0x00, 0x19, 0xFA); // ESC p m t1 t2
    return this;
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  toBase64(): string {
    const bytes = this.toUint8Array();
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

