const { bd, be } = require("../dist/index.cjs");

test("Errors on parsing wrong structure", () => {
    expect(
        () => bd.new(bd.int()).decode(be.encode(be.string("You can decode this.")))
    ).toThrow();
})

test("Encoding strings (utf8, utf16)", () => {
  const encodedUtf8 = be.encode(be.string("im a utf8 string"));
  expect(
    bd.new(bd.string()).decode(encodedUtf8)
  ).toBe("im a utf8 string");

  const encodedUtf16 = be.encode(be.string("im a utf16 string", "utf16"));
  expect(
    bd.new(bd.string("utf16")).decode(encodedUtf16)
  ).toBe("im a utf16 string");
})

test("Encoding signed numbers", () => {
  expect(bd.new(bd.i8()).decode(be.encode(be.i8(127)))).toBe(127);
  expect(bd.new(bd.i8()).decode(be.encode(be.i8(-128)))).toBe(-128);

  expect(bd.new(bd.i16()).decode(be.encode(be.i16(32_767)))).toBe(32_767);
  expect(bd.new(bd.i16()).decode(be.encode(be.i16(-32_768)))).toBe(-32_768);

  expect(bd.new(bd.i32()).decode(be.encode(be.i32(2_147_483_647)))).toBe(2_147_483_647);
  expect(bd.new(bd.i32()).decode(be.encode(be.i32(-2_147_483_648)))).toBe(-2_147_483_648);
  
  expect(bd.new(bd.i64()).decode(be.encode(be.i64(BigInt("9223372036854775807"))))).toEqual(BigInt("9223372036854775807"));
  expect(bd.new(bd.i64()).decode(be.encode(be.i64(BigInt("-9223372036854775808"))))).toEqual(BigInt("-9223372036854775808"));
})

test("Encoding unsigned numbers", () => {
  expect(bd.new(bd.u8()).decode(be.encode(be.u8(255)))).toBe(255);

  expect(bd.new(bd.u16()).decode(be.encode(be.u16(65_535)))).toBe(65_535);

  expect(bd.new(bd.u32()).decode(be.encode(be.u32(4_294_967_295)))).toBe(4_294_967_295);
 
  expect(bd.new(bd.u64()).decode(be.encode(be.u64(BigInt("18446744073709551615"))))).toEqual(BigInt("18446744073709551615"));
})

test("Encoding floats", () => {
  expect(
    bd.new(bd.f32()).decode(be.encode(be.f32(123.456789))).toString()
  ).toContain("123.4567");
  expect(
    bd.new(bd.f64()).decode(be.encode(be.f64(123.456789123456789))).toString()
  ).toContain("123.45678912");
})

test("Encoding arrays", () => {
  expect(
    bd.new(bd.array(bd.int())).decode(be.encode(be.array(be.int(5), be.int(10), be.int(15))))
  ).toEqual([ 5, 10, 15 ]);
})

test("Encoding maps", () => {
  expect(
    bd.new(bd.map(bd.string(), bd.int())).decode(be.encode(be.map(
      be.string("first"), be.int(5),
      be.string("second"), be.int(10),
      be.string("third"), be.int(15),
  ))))
    .toEqual({ first: 5, second: 10, third: 15 });
})

test("Encoding structs", () => {
  expect(
    bd.new(bd.struct({ name: bd.string(), number: bd.int() })).decode(be.encode(be.struct({
      name: be.string("JustCoding123"), number: be.int(50)
    })))
  ).toEqual({ name: "JustCoding123", number: 50 });
})