var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ByteDecoder: () => ByteDecoder,
  ByteEncoder: () => ByteEncoder,
  bd: () => bd,
  be: () => be
});
module.exports = __toCommonJS(src_exports);
var ByteDecoder = class {
  constructor() {
    this.schema = [];
    this.offset = 0;
  }
  static string(encoding = "utf8") {
    return { type: "string", encoding };
  }
  static i8() {
    return { type: "i", size: 8 };
  }
  static i16() {
    return { type: "i", size: 16 };
  }
  static i32() {
    return { type: "i", size: 32 };
  }
  static i64() {
    return { type: "i", size: 64 };
  }
  static u8() {
    return { type: "u", size: 8 };
  }
  static u16() {
    return { type: "u", size: 16 };
  }
  static u32() {
    return { type: "u", size: 32 };
  }
  static u64() {
    return { type: "u", size: 64 };
  }
  static f32() {
    return { type: "f", size: 32 };
  }
  static f64() {
    return { type: "f", size: 64 };
  }
  static array(type) {
    return { type: "array", itemType: type };
  }
  static map(keyType, valueType) {
    return { type: "map", keyType, valueType };
  }
  static struct(entries) {
    return { type: "struct", entries };
  }
  // Aliases
  static int() {
    return { type: "i", size: 32 };
  }
  static uint() {
    return { type: "u", size: 32 };
  }
  static float() {
    return { type: "f", size: 32 };
  }
  static new(...items) {
    return new ByteDecoder().add(...items);
  }
  __parseInt(size) {
    if (size === 8)
      return this.buffer.getInt8(this.offset++);
    else if (size === 16) {
      this.offset += 2;
      return this.buffer.getInt16(this.offset - 2);
    } else if (size === 32) {
      this.offset += 4;
      return this.buffer.getInt32(this.offset - 4);
    } else if (size === 64) {
      this.offset += 8;
      return this.buffer.getBigInt64(this.offset - 8);
    }
    throw new Error(`Invalid int size ${size}.`);
  }
  __parseUint(size) {
    if (size === 8)
      return this.buffer.getUint8(this.offset++);
    else if (size === 16) {
      this.offset += 2;
      return this.buffer.getUint16(this.offset - 2);
    } else if (size === 32) {
      this.offset += 4;
      return this.buffer.getUint32(this.offset - 4);
    } else if (size === 64) {
      this.offset += 8;
      return this.buffer.getBigUint64(this.offset - 8);
    }
    throw new Error(`Invalid uint size ${size}.`);
  }
  __parseFloat(size) {
    if (size === 32) {
      this.offset += 4;
      return this.buffer.getFloat32(this.offset - 4);
    }
    if (size === 64) {
      this.offset += 8;
      return this.buffer.getFloat64(this.offset - 8);
    }
    throw new Error(`Invalid float size ${size}.`);
  }
  __parseStringUTF8() {
    let content = "";
    while (this.buffer.getUint8(this.offset) !== 0) {
      content += String.fromCharCode(this.buffer.getUint8(this.offset++));
    }
    this.offset++;
    return content;
  }
  __parseStringUTF16() {
    let content = "";
    while (this.buffer.getUint16(this.offset) !== 0) {
      content += String.fromCharCode(this.buffer.getUint16(this.offset));
      this.offset += 2;
    }
    this.offset += 2;
    return content;
  }
  __parseString(encoding) {
    return encoding === "utf8" ? this.__parseStringUTF8() : this.__parseStringUTF16();
  }
  __parseArray(type) {
    const arraySize = this.__parseUint(8);
    const arr = [];
    for (let i = 0; i < arraySize; i++)
      arr.push(this.__parse(type));
    return arr;
  }
  __parseMap(keyType, valueType) {
    const mapSize = this.__parseUint(16);
    const value = {};
    for (let i = 0; i < mapSize; i++) {
      value[this.__parse(keyType)] = this.__parse(valueType);
    }
    return value;
  }
  __parseStruct(entries) {
    const dictSize = this.__parseUint(16);
    const len = Object.keys(entries).length;
    const value = {};
    if (len !== dictSize)
      throw new Error(`Size of structures don't match. (expected ${len}, got ${dictSize})`);
    for (let i = 0; i < dictSize; i++) {
      const key = this.__parseString("utf8");
      if (!entries[key])
        throw new Error(`Struct got unexpected key '${key}'.`);
      value[key] = this.__parse(entries[key]);
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
      return this.__parseString(part.encoding);
    if (part.type === "array")
      return this.__parseArray(part.itemType);
    if (part.type === "map")
      return this.__parseMap(part.keyType, part.valueType);
    if (part.type === "struct")
      return this.__parseStruct(part.entries);
    throw new Error("Invalid type.");
  }
  add(...types) {
    this.schema = this.schema.concat(types);
    return this;
  }
  decode(data) {
    this.buffer = new DataView(data);
    this.offset = 0;
    const parsed = [];
    for (const part of this.schema) {
      parsed.push(this.__parse(part));
    }
    if (this.offset !== data.byteLength) {
      throw new Error("Couldn't parse object.");
    }
    return parsed.length === 1 ? parsed[0] : parsed;
  }
};
var ByteEncoder = class {
  constructor() {
    this.buffer = new DataView(new ArrayBuffer(999999));
    this.offset = 0;
  }
  __addInt(size, value) {
    if (size === 8)
      this.buffer.setInt8(this.offset++, value);
    if (size === 16) {
      this.buffer.setInt16(this.offset, value);
      this.offset += 2;
    }
    ;
    if (size === 32) {
      this.buffer.setInt32(this.offset, value);
      this.offset += 4;
    }
    ;
    if (size === 64) {
      this.buffer.setBigInt64(this.offset, value);
      this.offset += 8;
    }
    ;
  }
  __addUint(size, value) {
    if (size === 8)
      this.buffer.setUint8(this.offset++, value);
    if (size === 16) {
      this.buffer.setUint16(this.offset, value);
      this.offset += 2;
    }
    ;
    if (size === 32) {
      this.buffer.setUint32(this.offset, value);
      this.offset += 4;
    }
    ;
    if (size === 64) {
      this.buffer.setBigUint64(this.offset, value);
      this.offset += 8;
    }
    ;
  }
  __addFloat(size, value) {
    if (size === 32) {
      this.buffer.setFloat32(this.offset, value);
      this.offset += 4;
    }
    if (size === 64) {
      this.buffer.setFloat64(this.offset, value);
      this.offset += 8;
    }
  }
  __addStringUTF8(value) {
    for (const char of value)
      this.buffer.setUint8(this.offset++, char.charCodeAt(0));
    this.buffer.setUint8(this.offset++, 0);
  }
  __addStringUTF16(value) {
    for (const char of value) {
      this.buffer.setUint16(this.offset, char.charCodeAt(0));
      this.offset += 2;
    }
    this.buffer.setUint16(this.offset, 0);
    this.offset += 2;
  }
  __add(item) {
    if (item.type === "string")
      return item.encoding === "utf8" ? this.__addStringUTF8(item.value) : this.__addStringUTF16(item.value);
    if (item.type === "i")
      return this.__addInt(item.size, item.value);
    if (item.type === "u")
      return this.__addUint(item.size, item.value);
    if (item.type === "f")
      return this.__addFloat(item.size, item.value);
    if (item.type === "array") {
      this.__addUint(8, item.values.length);
      for (const val of item.values) {
        this.__add(val);
      }
      return;
    }
    if (item.type === "map") {
      this.__addUint(16, Math.floor(item.entries.length / 2));
      for (let i = 0; i < item.entries.length; i += 2) {
        this.__add(item.entries[i]);
        this.__add(item.entries[i + 1]);
      }
      return;
    }
    if (item.type === "struct") {
      this.__addUint(16, Object.keys(item.entries).length);
      for (const [key, val] of Object.entries(item.entries)) {
        this.__addStringUTF8(key);
        this.__add(val);
      }
      return;
    }
  }
  add(...items) {
    for (const item of items)
      this.__add(item);
    return this;
  }
  static string(val, encoding = "utf8") {
    return { type: "string", value: val, encoding };
  }
  static i8(val) {
    return { type: "i", size: 8, value: val };
  }
  static i16(val) {
    return { type: "i", size: 16, value: val };
  }
  static i32(val) {
    return { type: "i", size: 32, value: val };
  }
  static i64(val) {
    return { type: "i", size: 64, value: val };
  }
  static u8(val) {
    return { type: "u", size: 8, value: val };
  }
  static u16(val) {
    return { type: "u", size: 16, value: val };
  }
  static u32(val) {
    return { type: "u", size: 32, value: val };
  }
  static u64(val) {
    return { type: "u", size: 64, value: val };
  }
  static f32(val) {
    return { type: "f", size: 32, value: val };
  }
  static f64(val) {
    return { type: "f", size: 64, value: val };
  }
  static array(...values) {
    return { type: "array", values };
  }
  static map(...entries) {
    return { type: "map", entries };
  }
  static struct(entries) {
    return { type: "struct", entries };
  }
  // Aliases
  static int(val) {
    return { type: "i", size: 32, value: val };
  }
  static uint(val) {
    return { type: "u", size: 32, value: val };
  }
  static float(val) {
    return { type: "f", size: 32, value: val };
  }
  static encode(...items) {
    return new ByteEncoder().add(...items)._encode();
  }
  _encode() {
    return this.buffer.buffer.slice(0, this.offset);
  }
};
var bd = ByteDecoder;
var be = ByteEncoder;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ByteDecoder,
  ByteEncoder,
  bd,
  be
});
