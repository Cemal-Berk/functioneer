import { describe, expect, test } from "@jest/globals";

import { Functioneer } from "../lib/functioneer";

if (!String.prototype["replaceAll"]) {
  String.prototype["replaceAll"] = function (str, newStr) {
    // If a regex pattern
    if (
      Object.prototype.toString.call(str).toLowerCase() === "[object regexp]"
    ) {
      return this.replace(str, newStr);
    }

    // If a string
    return this.replace(new RegExp(str, "g"), newStr);
  };
}

describe("FunctionRunner", () => {
  test("should return the function result as text when using run", async () => {
    const fp = new Functioneer({
      debug: false,
      returnJSONString: false,
      showHelpOnError: true,
    });

    fp.registerFunction("add", "Adds two numbers", (a: number, b: number) => {
      return a + b;
    })
      .addField("a", "number", "The first number to add")
      .addField("b", "number", "The second number to add");

    expect(await fp.run("add", [1, 2])).toBe("3");
  });

  test("should return the function result as JSON when using run", async () => {
    const fp = new Functioneer({
      debug: false,
      returnJSONString: true,
      showHelpOnError: true,
    });

    fp.registerFunction("add", "Adds two numbers", (a: number, b: number) => {
      return a + b;
    })
      .addField("a", "number", "The first number to add")
      .addField("b", "number", "The second number to add");

    expect(await fp.run("add", [1, 2])).toBe('{"success":true,"result":3}');
  });

  test("should return the function error as text when using run", async () => {
    const fp = new Functioneer({
      debug: false,
      returnJSONString: false,
      showHelpOnError: false,
    });

    fp.registerFunction("add", "Adds two numbers", (a: number, b: number) => {
      return a + b;
    })
      .addField("a", "number", "The first number to add")
      .addField("b", "number", "The second number to add");

    expect(await fp.run("add", [1, "a"])).toBe("Invalid number for field b");
  });

  test("should return the function error as JSON when using run", async () => {
    const fp = new Functioneer({
      debug: false,
      returnJSONString: true,
      showHelpOnError: false,
    });

    fp.registerFunction("add", "Adds two numbers", (a: number, b: number) => {
      return a + b;
    })
      .addField("a", "number", "The first number to add")
      .addField("b", "number", "The second number to add");

    expect(await fp.run("add", [1, "a"])).toBe(
      '{"success":false,"message":"Invalid number for field b"}'
    );
  });

  test("should return the function error and help as text when using run", async () => {
    const fp = new Functioneer({
      debug: false,
      returnJSONString: false,
      showHelpOnError: true,
    });

    fp.registerFunction("add", "Adds two numbers", (a: number, b: number) => {
      return a + b;
    })
      .addField("a", "number", "The first number to add")
      .addField("b", "number", "The second number to add");

    const result = await fp.run("add", [1, "a"]);
    const contains =
      result.toString().indexOf("Invalid number for field b") != -1 &&
      result.toString().indexOf("Function add:") != -1;

    expect(contains).toBe(true);
  });

  test("should return the function error and help as JSON when using run", async () => {
    const fp = new Functioneer({
      debug: false,
      returnJSONString: true,
      showHelpOnError: true,
    });

    fp.registerFunction("add", "Adds two numbers", (a: number, b: number) => {
      return a + b;
    })
      .addField("a", "number", "The first number to add")
      .addField("b", "number", "The second number to add");

    expect(await fp.run("add", [1, "a"])).toBe(
      '{"success":false,"message":"Invalid number for field b\\n\\nFunction add:\\n    a (number)\\tThe first number to add\\n    b (number)\\tThe second number to add\\n"}'
    );
  });

  test("should show help when functions are added and help is called", async () => {
    const fp = new Functioneer({
      debug: false,
      returnJSONString: false,
      showHelpOnError: true,
    });

    fp.registerFunction("add", "Adds two numbers", (a: number, b: number) => {
      return a + b;
    })
      .addField("a", "number", "The first number to add")
      .addField("b", "number", "The second number to add");
    fp.registerFunction(
      "subtract",
      "Subtracts two numbers",
      (a: number, b: number) => {
        return a + b;
      }
    )
      .addField("a", "number", "The first number to subtract")
      .addField("b", "number", "The second number to subtract");

    let result = await fp.getHelp()["replaceAll"]("\n", " ");
    result = result["replaceAll"]("\t", " ");
    result = result["replaceAll"]("\r", " ");
    do {
      result = result["replaceAll"]("  ", " ");
    } while (result.indexOf("  ") != -1);

    expect(result).toBe(
      `Syntax: <functionName> <arg1> <arg2> ... <argN> Functions: - add Adds two numbers a (number) The first number to add b (number) The second number to add - subtract Subtracts two numbers a (number) The first number to subtract b (number) The second number to subtract `
    );
  });

  test("should work correctly with process arguements", async () => {
    const fp = new Functioneer({
      debug: false,
      returnJSONString: false,
      showHelpOnError: true,
    });

    fp.registerFunction("add", "Adds two numbers", (a: number, b: number) => {
      return a + b;
    })
      .addField("a", "number", "The first number to add")
      .addField("b", "number", "The second number to add");
    const args = ["node", "index.js", "add", "1", "2"];
    const result = await fp.runArgv(args);
    expect(result).toBe("3");
  });

  test("should work correctly with function object call", async () => {
    const fp = new Functioneer({
      debug: false,
      returnJSONString: false,
      showHelpOnError: true,
    });

    fp.registerFunction("add", "Adds two numbers", (a: number, b: number) => {
      return a + b;
    })
      .addField("a", "number", "The first number to add")
      .addField("b", "number", "The second number to add");
    const result = await fp.runObj({
      functionName: "add",
      a: 1,
      b: 2,
    });
    expect(result).toBe("3");
  });
});
