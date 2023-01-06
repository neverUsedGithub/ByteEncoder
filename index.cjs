class ByteDecoder {
  constructor() {
    this.buffer = null;
    this.schema = [];
    this.offset = 0;
  }

  static string() { return { type: "string" } }
  static i8()  { return { type: "i", size: 8 } }
  static i16() { return { type: "i", size: 16 } }
  static i32() { return { type: "i", size: 32 } }
  static i64() { return { type: "i", size: 64 } }
  static u8()  { return { type: "u", size: 8 } }
  static u16() { return { type: "u", size: 16 } }
  static u32() { return { type: "u", size: 32 } }
  static u64() { return { type: "u", size: 64 } }
  static f32() { return { type: "f", size: 32 } }
  static f64() { return { type: "f", size: 64 } }
  static array(type) { return { type: "array", itemType: type } }
  static map(keyType, valueType) { return { type: "map", keyType, valueType } }
  static struct(entries) { return { type: "struct", entries } }
  // Aliases
  static int() { return { type: "i", size: 32 } }
  static uint() { return { type: "u", size: 32 } }
  static float() { return { type: "f", size: 32 } }

  static new(...items) {
    return new ByteDecoder().add(...items);
  }

  __parseInt(size) {
    if (size === 8) return this.buffer.getInt8(this.offset ++);
    else if (size === 16) { this.offset += 2; return this.buffer.getInt16(this.offset - 2); }
    else if (size === 32) { this.offset += 4; return this.buffer.getInt32(this.offset - 4); }
    else if (size === 64) { this.offset += 8; return this.buffer.getBigInt64(this.offset - 8); }

    throw new Error(`Invalid int size ${size}.`)
  }

  __parseUint(size) {
    if (size === 8) return this.buffer.getUint8(this.offset ++);
    else if (size === 16) { this.offset += 2; return this.buffer.getUint16(this.offset - 2); }
    else if (size === 32) { this.offset += 4; return this.buffer.getUint32(this.offset - 4); }
    else if (size === 64) { this.offset += 8; return this.buffer.getBigUint64(this.offset - 8); }
    
    throw new Error(`Invalid uint size ${size}.`)
  }

  __parseFloat(size) {
    if (size === 32) { this.offset += 4; return this.buffer.getFloat32(this.offset - 4); }
    if (size === 64) { this.offset += 8; return this.buffer.getFloat64(this.offset - 8); }
    
    throw new Error(`Invalid float size ${size}.`)
  }

  __parseString() {
    let content = "";
    while (this.buffer.getUint8(this.offset) !== 0) {
      content += String.fromCharCode(this.buffer.getUint8(this.offset ++));
    }
    this.offset ++;

    return content;
  }

  __parseArray(type) {
    const arraySize = this.__parseUint(8);
    const arr = [];

    for (let i = 0; i < arraySize; i++)
      arr.push(this.__parse(type));

    return arr;
  }

  __parseMap(keyType, valueType) {
    const mapSize = this.__parseUint(8);
    const value = {};

    for (let i = 0; i < mapSize; i++) {
      value[this.__parse(keyType)] = this.__parse(valueType);
    }

    return value;
  }

  __parseStruct(entries) {
    const dictSize = this.__parseUint(8);
    const len = Object.keys(entries).length;
    const value = {};
    
    if (len !== dictSize)
      throw new Error(`Size of structures don't match. (expected ${len}, got ${dictSize})`)

    for (let i = 0; i < dictSize; i++) {
      const key = this.__parseString();
      value[key] = this.__parse(entries[key])
    }

    return value;
  }

  __parse(part) {
    if (part.type === "i")
      return this.__parseInt(part.size);
    
    if (part.type === "u")
      return this.__parseUint(part.size);
    
    if (part.type === "f")
      return this.__parseFloat(part.size);

    if (part.type === "string")
      return this.__parseString();

    if (part.type === "array")
      return this.__parseArray(part.itemType);

    if (part.type === "map")
      return this.__parseMap(part.keyType, part.valueType);

    if (part.type === "struct")
      return this.__parseStruct(part.entries);
  }

  add(...types) { this.schema = this.schema.concat(types); return this; }
  
  decode(data) {
    this.buffer = new DataView(data);
    const parsed = [];

    for (const part of this.schema) {
      parsed.push(this.__parse(part))
    }

    return parsed;
  }
}

class ByteEncoder {
  constructor() {
    this.buffer = new DataView(new ArrayBuffer(999999));
    this.offset = 0;
    this.toenc = [];
  }

  __addInt(size, value) {
    if (size === 8)  this.buffer.setInt8(this.offset ++, value);
    if (size === 16) { this.buffer.setInt8(this.offset, value); this.offset += 2; };
    if (size === 32) { this.buffer.setInt8(this.offset, value); this.offset += 4; };
    if (size === 64) { this.buffer.setBigInt64(this.offset, value); this.offset += 8; };
  }

  __addUint(size, value) {
    if (size === 8)  this.buffer.setUint8(this.offset ++, value);
    if (size === 16) { this.buffer.setUint8(this.offset, value); this.offset += 2; };
    if (size === 32) { this.buffer.setUint8(this.offset, value); this.offset += 4; };
    if (size === 64) { this.buffer.setBigUint64(this.offset, value); this.offset += 8; };
  }

  __addFloat(size, value) {
    if (size === 32) { this.buffer.setFloat32(this.offset, value); this.offset += 4; }
    if (size === 64) { this.buffer.setFloat64(this.offset, value); this.offset += 8; }
  }

  __addString(value) {
    for (const char of value)
      this.buffer.setUint8(this.offset ++, char.charCodeAt(0));
    this.buffer.setUint8(this.offset ++, 0);
  }

  __add(item) {
    if (item.type === "string")
      return this.__addString(item.value);

    if (item.type === "i")
      return this.__addInt(item.size, item.value);
    
    if (item.type === "u")
      return this.__addUint(item.size, item.value);
    
    if (item.type === "f")
      return this.__addFloat(item.size, item.value)

    if (item.type === "array") {
      this.__addUint(8, item.values.length);
      for (const val of item.values) {
        this.__add(val);
      }
      return;
    }

    if (item.type === "map") {
      this.__addUint(8, Math.floor(item.entries.length / 2));
      
      for (let i = 0; i < item.entries.length; i += 2) {
        this.__add(item.entries[i]);
        this.__add(item.entries[i + 1]);
      }
      return;
    }

    if (item.type === "struct") {
      this.__addUint(8, Object.keys(item.entries).length);

      for (const [key, val] of Object.entries(item.entries)) {
        this.__addString(key);
        this.__add(val);
      }
      return;
    }
  }

  add(...items) {
    for (const item of items)
      this.__add(item)
    return this;
  }

  static string(str) { return { type: "string", value: str }; }
  static i8(val)  { return { type: "i", size: 8, value: val }; }
  static i16(val) { return { type: "i", size: 16, value: val }; }
  static i32(val) { return { type: "i", size: 32, value: val }; }
  static i64(val) { return { type: "i", size: 64, value: val }; }
  static u8(val)  { return { type: "u", size: 8, value: val }; }
  static u16(val) { return { type: "u", size: 16, value: val }; }
  static u32(val) { return { type: "u", size: 32, value: val }; }
  static u64(val) { return { type: "u", size: 64, value: val }; }
  static f32(val) { return { type: "f", size: 32, value: val } }
  static f64(val) { return { type: "f", size: 64, value: val } }
  static array(...values) { return { type: "array", values } } 
  static map(...entries) { return { type: "map", entries } }
  static struct(entries) { return { type: "struct", entries } }
  // Aliases
  static int(val) { return { type: "i", size: 32, value: val } }
  static uint(val) { return { type: "u", size: 32, value: val } }
  static float(val) { return { type: "f", size: 32, value: val } }
  
  static encode(...items) {
    return new ByteEncoder().add(...items)._encode();
  }
  
  _encode() {
    return this.buffer.buffer.slice(0, this.offset);
  }
}

module.exports = {
  bd: ByteDecoder,
  be: ByteEncoder,
  ByteDecoder,
  ByteEncoder
}