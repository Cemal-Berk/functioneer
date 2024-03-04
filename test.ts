import { FunctionField, Functioneer } from "./lib/index";

const func = new Functioneer();
func
  .registerFunction("add", "Add two numbers", (a: number, b: number) => a + b)
  .addField("a", "number", "The first field to add")
  .addField("b", "number", "The second field to add");

func.registerFunctionWithSchema(
  "subtract",
  "Subtract two numbers",
  (a: number, b: number) => a - b,
  [
    //schema
    new FunctionField("a", "number", "The first field to subtract"),
    new FunctionField("b", "number", "The first field to subtract"),
  ]
);

func.runObj({ functionName: "add", a: 1, b: 2 }).then(console.log); // 3
func.run("add", [1, 2]).then(console.log); // 3

func.run("subtract", [2, 1]).then(console.log); // 3
