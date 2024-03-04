import { anyUint8ArrayToBase64 } from "./converters";
import { FunctionField } from "./function-field";
import {
  FunctionObjectCall,
  FunctionRunnerOptions,
  FunctionRunResult,
} from "./interfaces";
import { InvokableFunction } from "./invokable-function";

/***
 * Main Functioneer class for running functions
 */
export class Functioneer {
  /**
   * The default options for the function runner
   */
  public options: FunctionRunnerOptions = {
    /**
     * If true, logs info  to console
     */
    debug: false,
    /**
     * If true, returns JSON instead of string
     */
    returnJSONString: true,
    /**
     * If true, automatically shows help on error
     */
    showHelpOnError: true,
  };

  /**
   * Helper function to get console logger based on debug option
   * @returns
   */
  private getLog() {
    if (this.options.debug) {
      return console.log;
    }
    return () => {};
  }

  /**
   * Returns a successful result
   * @param result The result to return
   * @returns String or FunctionRunResult based on retrunJSONString option
   */
  private returnSuccess(result: any): string | FunctionRunResult {
    if (this.options.returnJSONString) {
      return JSON.stringify({
        success: true,
        result,
      });
    }
    return result + "";
  }
  /**
   * Returns an error result
   * @param message The error message to return
   * @returns String or FunctionRunResult based on retrunJSONString option
   */
  private returnError(message: string): string | FunctionRunResult {
    if (this.options.returnJSONString) {
      return JSON.stringify({
        success: false,
        message,
      });
    }
    return message + "";
  }

  /**
   * @param options FunctionRunnerOptions object  to override default options
   */
  constructor(options?: FunctionRunnerOptions) {
    if (options != undefined) {
      this.options = { ...this.options, ...options };
    }
  }

  //Contains all registered functions
  private functions: {
    [name: string]: { description: string; func: InvokableFunction };
  } = {};

  /**
   * Registers a function
   * @param name The function name (must be unique)
   * @param description The function description to show in help
   * @param func The function to run
   */
  public registerFunction(name: string, description: string, func: Function) {
    this.functions[name] = {
      description: description,
      func: new InvokableFunction(func, this.getLog()),
    };
    return this.functions[name].func;
  }

  /**
   * Returns a function with a parameter schema
   * @param name The function name
   * @param description The function description to show in help
   * @param func The function to run
   * @param schema The function parameter schema
   * @returns
   */
  public registerFunctionWithSchema(
    name: string,
    description: string,
    func: Function,
    schema: FunctionField[]
  ) {
    this.functions[name] = {
      description: description,
      func: new InvokableFunction(func, this.getLog()),
    };
    schema.forEach((field) => {
      this.functions[name].func.addFunctionField(field);
    });
    return this.functions[name];
  }

  /**
   * Returns help for a function
   * @param name The function name
   * @returns string
   */
  public getFunctionHelp(name: string): string {
    if (this.functions[name] === undefined) {
      return `Function ${name} not found`;
    }
    let out = `Function ${name}:\n`;
    let fields = this.functions[name].func.getFields();
    fields.forEach((field) => {
      out += `    ${field.getName()} (${field.getType()})\t${field.getDescription()}\n`;
    });
    return out;
  }

  /**
   * Returns help for all functions
   * @returns String
   */
  public getHelp(): string {
    let out = "Syntax: <functionName> <arg1> <arg2> ... <argN>\n";
    out += "Functions:\n";
    for (let key in this.functions) {
      out += `- ${key} \t${this.functions[key].description} \n`;
      let fields = this.functions[key].func.getFields();
      fields.forEach((field) => {
        out += `\t${field.getName()} (${field.getType()})\t ${field.getDescription()}\n`;
      });
    }
    return out;
  }

  /**
   * Shows help for all functions in console
   * @returns
   */
  public showHelp() {
    return console.log(this.getHelp());
  }

  /**
   * Runs a function with arguments from argv
   * @param argv The arguments array. argv[2] contains the function name and the rest of the array contains the function arguments
   * @returns String or FunctionRunResult based on retrunJSONString option
   */
  public async runArgv(argv: string[]): Promise<string | FunctionRunResult> {
    if (argv.length < 3) {
      return this.returnError("No function name provided");
    }
    let name = argv[2];
    let args = argv.slice(3);
    return this.run(name, args);
  }

  /**
   * Runs a function from a function object call
   * @param obj The function object call containing the functionName and all function arguements
   * @returns String on FunctionRunResult based on retrunJSONString option
   */
  public async runObj(
    obj: FunctionObjectCall
  ): Promise<string | FunctionRunResult> {
    if (obj.functionName === undefined) {
      return this.returnError("No functionName provided");
    }
    if (this.functions[obj.functionName] === undefined) {
      const notFoundLabel = `Function ${obj.functionName} not found ${
        this.options.showHelpOnError ? "\n\n" + this.getHelp() : ""
      }`;
      return this.returnError(notFoundLabel);
    }
    const fields = this.functions[obj.functionName].func.getFields();
    const argArray = [];
    fields.forEach((field) => {
      argArray.push(obj[field.getName()]);
    });
    return await this.run(obj.functionName, argArray);
  }

  /**
   * Runs a function
   * @param name The function name
   * @param args The function arguments
   * @returns String on FunctionRunResult based on retrunJSONString option
   */
  public async run(
    name: string,
    args: any[]
  ): Promise<string | FunctionRunResult> {
    this.getLog()(`» ${name} ${JSON.stringify(args)}`);

    if (this.functions[name] === undefined) {
      const notFoundLabel = `Function ${name} not found ${
        this.options.showHelpOnError ? "\n\n" + this.getHelp() : ""
      }`;
      return this.returnError(notFoundLabel);
    }
    let result;
    try {
      result = await this.functions[name].func.run(args);
    } catch (e) {
      const errorLabel =
        e +
        (this.options.showHelpOnError
          ? "\n\n" + this.getFunctionHelp(name)
          : "");
      return this.returnError(errorLabel);
    }

    if (result instanceof Uint8Array || result instanceof Object) {
      result = anyUint8ArrayToBase64(result);
    }
    return this.returnSuccess(result);
  }
}
