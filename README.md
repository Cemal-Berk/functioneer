# Functioneer

Functioneer is a utility library that simplifies CLI , web and serverless development.
Declare a set of functions and their arguements. Functions can then be called in the following ways:

- manually
- via command line arguements - for CLI development
- as body / pathParameters / queryString - for web development
- for javascript bridges

## Installation

Run `npm install functioneer` and import to your project.

## Why use functioneer

Functioneer simplifies and unifies development of CLI, Web, Serverless, in-browser and browser extension tools:

- Is portable (runs on node / deno / bun / browser / browser extension platforms).
- Is small (less than 100KB compressed).
- Has zero dependencies.
- Handles data validation.
- Provides a unified solid platform for declarative functional programing.

# Usage

## Quick use

Declare a function:

    import {Functioneer} from "functioneer";

    const func = new  Functioneer();
    //Declare a function to add two numbers
    func.registerFunction("add", "Adds two numbers", (a: number,  b: number)  =>  {
        return  a  +  b;
    })
    .addField("a",  "number",  "The first number to add")
    .addField("b",  "number",  "The second number to add");

    //Run manually
    const result = await func.run("add",["1","2"]); //should be 3

### CLI development

Run a function automatically through the process.argv

    const result = await func.runArgv(process.argv);

Get dynamic help via:

    console.log(func.getHelp()); or func.showHelp();

### Web development

Functioneer includes helpers for Express and Amazon Lamda Functions:

#### Express

Please refer to [functioneer-express](https://github.com/Cemal-Berk/functioneer-express)

#### AWS Lambda

Please refer to [functioneer-aws](https://github.com/Cemal-Berk/functioneer-aws)

### Webassembly bridging

Functioneer can be used to bridge execution of webassemply code in the client side, and provide a single and easy to use interface for calling native code from javascript code.

    const func = new Functioneer();
    //Consider a function exported by webAssembly
    WebAssembly.instantiateStreaming(fetch("table.wasm")).then((obj) => {
        const tbl = obj.instance.exports.tbl; //Exported references
        func.registerFunction("tableGet", "slow wasm function", async (a: number) => {
        return tbl.get(a)();
        }).addField("a","number","The table number to get");
    });
    func.run("tableGet", [0]);  //returns 13;
    func.run("tableGet", [1]);	//returns 42;

## Registering functions and adding fields

Functions can be registered via `registerFunction`. This allows method chaining for adding fields:

    const func = new Functioneer();
    func.registerFunction("function", "description", async (a: number) => { a; }).addField("a","number","The field to get);

Functions can also be registered via `registerFunctionWithSchema`, where a field schema (array of FunctionField objects) must be provided:

    const schema: FunctionField[] = [
        //schema
        new FunctionField("a", "number", "The first field to subtract", undefined),
        new FunctionField("b", "number", "The second field to subtract", undefined),
    ];
    func.registerFunctionWithSchema( "subtract","Subtract two numbers",  (a: number, b: number) => a - b, schema);

## Data types and validations

The following fields are supporterd:

| Field type | Value              | Description                    |
| ---------- | ------------------ | ------------------------------ |
| String     | "string"           | A non empty string             |
| Number     | "number"           | A number                       |
| Boolean    | "boolean"          | A boolean value (true / false) |
| Array      | "array"            | A JSON encoded array           |
| UInt8Array | "base64UInt8Array" | A base64 encoded UInt8 Array   |
| Custom     | "custom"           | See below                      |

_All fields are validated on execution. If validation fails an error is thrown_

### Custom validations

You can mark a field as custom and provide a custom validation:

    func.addField("c","custom","A custom field" , (fieldValue: string):boolean => {
        return fieldValue == "custom";
    });

Custom validation can be asynchronous:

    func.addField("c","custom","A custom field" , async (fieldValue: string):Promise<boolean> => {
        return await longValidationFunction(fieldValue);
    });

## Function returns

Functioneer can return either the function result or a JSON encoded object containing the function result of an appropriate error message. The behavior is defined in the construction options.

### JSON Result schema

    export  interface  FunctionRunResult  {
    	success:  boolean;	//true or false
    	result?:  any;		//the function result
    	message?:  string  |  undefined;	//Contains the error if success == false
    }

## Running functions

### Manually

Registered functions can be run manually via the `run` method. Arguments are provided as an array

    func.run("add",[1,2]);

### Via objects

Functions can be run by passing an object. Each argument should be in the object. The function name is provided in the functionName property:

    func.runObj({ functionName: "add", a: 1, b: 2 })

### From process.argv

Functions can be run by passing the process.argv array. The 3rd element of the array is the function name

    func.runArgv(process.argv)

## Configuration options

The following options can be set when initializing a Functioneer object
| Option | Default value | Meaning |
| ---------------- | ------------- | ------------------------------------------------------------------------------------- |
| debug | true | Show debug info when running (via console.log) |
| returnJSONString | true | Returns result as JSON encoded object (see above). If false result is returned as is |
| showHelpOnError | true | Automatically show help on erroneous input (for CLI development) |

# Building and testing

You can build the project by running `npm run build`.
Tests are run by running `npm run test`

# License

Functioneer is licensed under MIT license
