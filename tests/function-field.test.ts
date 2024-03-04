import { describe, expect, test } from "@jest/globals";

import { FunctionField } from "../lib/function-field";

describe("FunctionField", () => {
  test("should return the description", () => {
    const field = new FunctionField(
      "test",
      "string",
      "test description",
      undefined
    );
    expect(field.getDescription()).toBe("test description");
  });

  test("should return the name", () => {
    const field = new FunctionField(
      "test",
      "string",
      "test description",
      undefined
    );
    expect(field.getName()).toBe("test");
  });

  test("should return the type", () => {
    const field = new FunctionField(
      "test",
      "string",
      "test description",
      undefined
    );
    expect(field.getType()).toBe("string");
  });

  test("should return the converted string value", () => {
    const field = new FunctionField(
      "test",
      "string",
      "test description",
      undefined
    );
    expect(field.convert("test")).toBe("test");
  });

  test("should return the converted number value", () => {
    const field = new FunctionField(
      "test",
      "number",
      "test description",
      undefined
    );
    expect(field.convert("123")).toBe(123);
  });

  test("should return the converted boolean value", () => {
    const field = new FunctionField(
      "test",
      "boolean",
      "test description",
      undefined
    );
    expect(field.convert("true")).toBe(true);
  });

  test("should return the converted array value", () => {
    const field = new FunctionField(
      "test",
      "array",
      "test description",
      undefined
    );
    expect(field.convert("[1,2,3]")).toStrictEqual([1, 2, 3]);
  });

  test("should return the converted base64UInt8Array value", () => {
    const field = new FunctionField(
      "test",
      "base64UInt8Array",
      "test description",
      undefined
    );
    expect(field.convert("dGVzdA==")).toStrictEqual(
      new Uint8Array([116, 101, 115, 116])
    );
  });

  test("should validate test as string", async () => {
    const field = new FunctionField(
      "test",
      "string",
      "test description",
      undefined
    );
    await expect(field.validate("test")).resolves.toBe(true);
  });

  test("should not validate empty string", async () => {
    const field = new FunctionField(
      "test",
      "string",
      "test description",
      undefined
    );

    await expect(field.validate("")).rejects.toBe(
      "Invalid string length for field test"
    );
  });

  test("should validate 123 as number ", async () => {
    const field = new FunctionField(
      "test",
      "number",
      "test description",
      undefined
    );

    await expect(field.validate("123")).resolves.toBe(true);
  });

  test("should not validate test as number", async () => {
    const field = new FunctionField(
      "test",
      "number",
      "test description",
      undefined
    );
    await expect(field.validate("test")).rejects.toBe(
      "Invalid number for field test"
    );
  });

  test("should validate true as boolean", async () => {
    const field = new FunctionField(
      "test",
      "boolean",
      "test description",
      undefined
    );
    await expect(field.validate("true")).resolves.toBe(true);
  });

  test("should not validate test as boolean", async () => {
    const field = new FunctionField(
      "test",
      "boolean",
      "test description",
      undefined
    );
    await expect(field.validate("test")).rejects.toBe(
      "Invalid boolean for field test"
    );
  });

  test("should validate [1,2,3] as array", async () => {
    const field = new FunctionField(
      "test",
      "array",
      "test description",
      undefined
    );
    await expect(field.validate("[1,2,3]")).resolves.toBe(true);
  });

  test("should not validate test as array", async () => {
    const field = new FunctionField(
      "test",
      "array",
      "test description",
      undefined
    );
    await expect(field.validate("test")).rejects.toBe(
      "Invalid JSON array for field test"
    );
  });

  test("should validate dGVzdA= as base64UInt8Array", async () => {
    const field = new FunctionField(
      "test",
      "base64UInt8Array",
      "test description",
      undefined
    );
    await expect(field.validate("dGVzdA==")).resolves.toBe(true);
  });

  test("should not validate test as base64UInt8Array", async () => {
    const field = new FunctionField(
      "test",
      "base64UInt8Array",
      "test description",
      undefined
    );
    await expect(field.validate("123")).rejects.toBe(
      "Invalid base64 string for field test"
    );
  });

  test("should run custom validation function", async () => {
    const field = new FunctionField(
      "test",
      "custom",
      "test description",
      async () => true
    );
    await expect(field.validate("test")).resolves.toBe(true);
  });

  test("should fail custom validation when no function is provided", async () => {
    const field = new FunctionField(
      "test",
      "custom",
      "test description",
      undefined
    );
    await expect(field.validate("123")).rejects.toBe(
      "Custom validation is undefined for field test"
    );
  });
});
