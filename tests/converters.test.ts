import { describe, expect, test } from "@jest/globals";
import {
  stringToBoolean,
  Uint8ArrayToBase64,
  anyUint8ArrayToBase64,
  arrayToString,
  base64ToUint8Array,
  stringToArray,
  stringToNumber,
} from "../lib/converters";

describe("stringToNumber", () => {
  test('should return 123 for "123"', () => {
    expect(stringToNumber("123")).toBe(123);
  });
});

describe("stringToArray", () => {
  test('should return [1,2,3] for "[1,2,3]"', () => {
    expect(stringToArray("[1,2,3]")).toEqual([1, 2, 3]);
  });
});

describe("arrayToString", () => {
  test('should return "[116,101,115,116]" for [116, 101, 115, 116]', () => {
    expect(arrayToString([116, 101, 115, 116])).toBe("[116,101,115,116]");
  });
});

describe("base64ToUint8Array", () => {
  test('should return "test" for "dGVzdA=="', () => {
    expect(base64ToUint8Array("dGVzdA==")).toEqual(
      new Uint8Array([116, 101, 115, 116])
    );
  });
});

describe("stringToBoolean", () => {
  test('should return true for "true"', () => {
    expect(stringToBoolean("true")).toBe(true);
  });

  test('should return false for "false"', () => {
    expect(stringToBoolean("false")).toBe(false);
  });

  test('should return false for "anything else"', () => {
    expect(stringToBoolean("anything else")).toBe(false);
  });
});

describe("Uint8ArrayToBase64", () => {
  test('should return "dGVzdA==" for "test"', () => {
    expect(Uint8ArrayToBase64(new TextEncoder().encode("test"))).toBe(
      "dGVzdA=="
    );
  });
});

describe("anyUint8ArrayToBase64", () => {
  test('should return "dGVzdA==" for "test"', () => {
    expect(anyUint8ArrayToBase64(new Uint8Array([116, 101, 115, 116]))).toBe(
      "dGVzdA=="
    );
  });
});
