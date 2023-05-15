type AnyJSON = {
    [key: string]: any;
};
type DecodedType = number | bigint | string | AnyJSON | boolean;
declare class ByteDecoder {
    buffer: DataView;
    schema: AnyJSON[];
    offset: number;
    constructor();
    static string(encoding?: ("utf8" | "utf16")): {
        type: string;
        encoding: "utf8" | "utf16";
    };
    static i8(): {
        type: string;
        size: number;
    };
    static i16(): {
        type: string;
        size: number;
    };
    static i32(): {
        type: string;
        size: number;
    };
    static i64(): {
        type: string;
        size: number;
    };
    static u8(): {
        type: string;
        size: number;
    };
    static u16(): {
        type: string;
        size: number;
    };
    static u32(): {
        type: string;
        size: number;
    };
    static u64(): {
        type: string;
        size: number;
    };
    static f32(): {
        type: string;
        size: number;
    };
    static f64(): {
        type: string;
        size: number;
    };
    static bool(): {
        type: string;
    };
    static array(type: AnyJSON): {
        type: string;
        itemType: AnyJSON;
    };
    static map(keyType: AnyJSON, valueType: AnyJSON): {
        type: string;
        keyType: AnyJSON;
        valueType: AnyJSON;
    };
    static struct(entries: AnyJSON): {
        type: string;
        entries: AnyJSON;
    };
    static int(): {
        type: string;
        size: number;
    };
    static uint(): {
        type: string;
        size: number;
    };
    static float(): {
        type: string;
        size: number;
    };
    static boolean(): {
        type: string;
    };
    static new(...items: any[]): ByteDecoder;
    __parseBool(): boolean;
    __parseInt(size: number): number | bigint;
    __parseUint(size: number): number | bigint;
    __parseFloat(size: number): number;
    __parseStringUTF8(): string;
    __parseStringUTF16(): string;
    __parseString(encoding: "utf8" | "utf16"): string;
    __parseArray(type: AnyJSON): DecodedType[];
    __parseMap(keyType: AnyJSON, valueType: AnyJSON): AnyJSON;
    __parseStruct(entries: AnyJSON): {};
    __parse(part: AnyJSON): DecodedType;
    add(...types: AnyJSON[]): this;
    decode(data: ArrayBufferLike): DecodedType;
}
declare class ByteEncoder {
    buffer: DataView;
    offset: number;
    constructor();
    __addBool(value: boolean): void;
    __addInt(size: number, value: number): void;
    __addUint(size: number, value: number): void;
    __addFloat(size: number, value: number): void;
    __addStringUTF8(value: string): void;
    __addStringUTF16(value: string): void;
    __add(item: AnyJSON): void;
    add(...items: AnyJSON[]): this;
    static string(val: string, encoding?: ("utf8" | "utf16")): {
        type: string;
        value: string;
        encoding: "utf8" | "utf16";
    };
    static i8(val: number): {
        type: string;
        size: number;
        value: number;
    };
    static i16(val: number): {
        type: string;
        size: number;
        value: number;
    };
    static i32(val: number): {
        type: string;
        size: number;
        value: number;
    };
    static i64(val: bigint): {
        type: string;
        size: number;
        value: bigint;
    };
    static u8(val: number): {
        type: string;
        size: number;
        value: number;
    };
    static u16(val: number): {
        type: string;
        size: number;
        value: number;
    };
    static u32(val: number): {
        type: string;
        size: number;
        value: number;
    };
    static u64(val: bigint): {
        type: string;
        size: number;
        value: bigint;
    };
    static f32(val: number): {
        type: string;
        size: number;
        value: number;
    };
    static f64(val: bigint): {
        type: string;
        size: number;
        value: bigint;
    };
    static bool(val: boolean): {
        type: string;
        value: boolean;
    };
    static array(...values: AnyJSON[]): {
        type: string;
        values: AnyJSON[];
    };
    static map(...entries: AnyJSON[]): {
        type: string;
        entries: AnyJSON[];
    };
    static struct(entries: AnyJSON): {
        type: string;
        entries: AnyJSON;
    };
    static int(val: number): {
        type: string;
        size: number;
        value: number;
    };
    static uint(val: number): {
        type: string;
        size: number;
        value: number;
    };
    static float(val: number): {
        type: string;
        size: number;
        value: number;
    };
    static boolean(val: boolean): {
        type: string;
        value: boolean;
    };
    static encode(...items: any[]): ArrayBuffer;
    _encode(): ArrayBuffer;
}
declare const bd: typeof ByteDecoder;
declare const be: typeof ByteEncoder;

export { ByteDecoder, ByteEncoder, bd, be };
