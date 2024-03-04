import { describe, expect, test } from "@jest/globals";
import { InvokableFunction } from "../lib/invokable-function";
import { FunctionField } from "../lib";

describe("InvokableFunction", () => {
  test("should return the function result when using addField", async () => {
    const func = new InvokableFunction(
      (a: number, b: number) => a + b,
      () => ""
    );
    func.addField("a", "number", "The first number to add");
    func.addField("b", "number", "The second number to add");
    expect(await func.run([1, 2])).toBe(3);
  });

  test("should fail with validation error when running with non validating fields", async () => {
    const func = new InvokableFunction(
      (a: number, b: number) => a + b,
      () => ""
    );
    func.addField("a", "number", "The first number to add");
    func.addField("b", "number", "The second number to add");
    await expect(func.run([1, "a"])).rejects.toBe("Invalid number for field b");
  });

  test("should fail with validation error when running validate with non validating fields ", async () => {
    const func = new InvokableFunction(
      (a: number, b: number) => a + b,
      () => ""
    );
    func.addField("a", "number", "The first number to add");
    func.addField("b", "number", "The second number to add");
    await expect(func.validate([1, "a"])).rejects.toBe(
      "Invalid number for field b"
    );
  });

  test("should return the function result when using addFunctionField", async () => {
    const func = new InvokableFunction(
      (a: number, b: number) => a + b,
      () => ""
    );
    func.addFunctionField(
      new FunctionField("a", "number", "The first number to add", undefined)
    );
    func.addFunctionField(
      new FunctionField("b", "number", "The first number to add", undefined)
    );
    expect(await func.run([1, 2])).toBe(3);
  });

  test("should return the function result when using setFields", async () => {
    const func = new InvokableFunction(
      (a: number, b: number) => a + b,
      () => ""
    );
    const fields = [
      new FunctionField("a", "number", "The first number to add", undefined),
      new FunctionField("b", "number", "The first number to add", undefined),
    ];
    func.setFields(fields);
    expect(await func.run([1, 2])).toBe(3);
  });

  test("should return the added fields when using getFields", async () => {
    const func = new InvokableFunction(
      (a: number, b: number) => a + b,
      () => ""
    );
    func.addField("a", "number", "The first number to add");
    func.addField("b", "number", "The second number to add");
    expect(func.getFields().length).toBe(2);
  });

  test("should return the field when using getFields", async () => {
    const func = new InvokableFunction(
      (a: number, b: number) => a + b,
      () => ""
    );
    func.addField("a", "number", "The first number to add");
    func.addField("b", "number", "The second number to add");
    expect(func.getFieldByIndex(0).getName()).toBe("a");
  });
});
