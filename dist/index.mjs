// lib/converters.ts
function anyUint8ArrayToBase64(input) {
  if (input instanceof Uint8Array) {
    return Uint8ArrayToBase64(input);
  }
  if (input instanceof Object) {
    const output = [];
    Object.keys(input).forEach((key) => {
      output[key] = anyUint8ArrayToBase64(input[key]);
    });
    return output;
  }
  return input;
}
function stringToNumber(str) {
  return parseInt(str);
}
function stringToBoolean(str) {
  return str.toLowerCase() === "true";
}
function stringToArray(str) {
  return JSON.parse(str);
}
function arrayToString(arr) {
  return JSON.stringify(arr);
}
function Uint8ArrayToBase64(bytes) {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function base64ToUint8Array(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

// lib/function-field.ts
var FunctionField = class {
  constructor(name, type, description, validation) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.validation = validation;
  }
  /**
   * Gets the field description for showing in help
   * @returns
   */
  getDescription() {
    return this.description;
  }
  /**
   * Gets the field name for showing in help
   */
  getName() {
    return this.name;
  }
  /**
   * Gets the field type for showing in help
   */
  getType() {
    return this.type;
  }
  /**
   * Converts the field to the expected type
   * @param fieldValue The field value
   * @throws Error if the field value is invalid and cannot be converted
   * @returns the converted value
   */
  convert(fieldValue) {
    if (this.type == "string") {
      return fieldValue + "";
    }
    if (this.type == "number") {
      return stringToNumber(fieldValue);
    }
    if (this.type == "boolean") {
      return stringToBoolean(fieldValue);
    }
    if (this.type == "array") {
      return stringToArray(fieldValue);
    }
    if (this.type == "base64UInt8Array") {
      return base64ToUint8Array(fieldValue);
    }
    throw "Invalid field type " + this.type + " for field " + this.name;
  }
  /**
   * Validates the field value
   * @param fieldValue The value to validate
   * @returns Promis<Boolean>
   */
  async validate(fieldValue) {
    if (this.type == "string") {
      if (fieldValue.length <= 0)
        throw "Invalid string length for field " + this.name;
      return true;
    }
    if (this.type == "number") {
      if (isNaN(parseInt(fieldValue))) {
        throw "Invalid number for field " + this.name;
      }
      return true;
    }
    if (this.type == "boolean") {
      if (fieldValue != "true" && fieldValue != "false") {
        throw "Invalid boolean for field " + this.name;
      }
      return true;
    }
    if (this.type == "array") {
      try {
        if (!(Array.isArray(JSON.parse(fieldValue)) && JSON.parse(fieldValue).length > 0)) {
          throw "Invalid JSON array for field " + this.name;
        }
      } catch (e) {
        throw "Invalid JSON array for field " + this.name;
      }
      return true;
    }
    if (this.type == "base64UInt8Array") {
      const str = fieldValue + "";
      const notBase64 = /[^A-Z0-9+\/=]/i;
      const len = str.length;
      if (!len || len % 4 !== 0 || notBase64.test(str)) {
        throw "Invalid base64 string for field " + this.name;
      }
      const firstPaddingChar = str.indexOf("=");
      if (firstPaddingChar === -1 || firstPaddingChar === len - 1 || firstPaddingChar === len - 2 && str[len - 1] === "=") {
        return true;
      }
      throw "Invalid base64 string for field " + this.name;
    }
    if (this.type == "custom") {
      if (this.validation == void 0) {
        throw "Custom validation is undefined for field " + this.name;
      }
      const validationResult = await this.validation(fieldValue);
      if (validationResult === false) {
        throw "Custom validation failed for field " + this.name;
      }
      return true;
    }
    throw "Invalid field type " + this.type + " for field " + this.name;
  }
};

// lib/invokable-function.ts
var InvokableFunction = class {
  constructor(callback, log) {
    this.fields = [];
    this.callback = callback;
    this.log = log;
  }
  /**
   * Validate the argument passed to the function
   * @param args The arguments to validate
   * @throws Error if the arguments are invalid
   * @returns true if the arguments are valid
   */
  async validate(args) {
    if (this.fields.length != args.length) {
      throw `Invalid number of arguments. Expected 
        ${this.fields.length} but got ${args.length}`;
    }
    for (let i = 0; i < args.length; i++) {
      if (await this.fields[i].validate(args[i]) === false) {
        throw `Invalid argument value. Argument 
          ${this.fields[i].getName()} at index ${i} did not pass validation for type ${this.fields[i].getType()}`;
      }
    }
    return true;
  }
  /**
   * Convert the arguments to the expected types
   * @param args The arguments to convert
   * @returns true if the arguments are valid
   */
  convertArgs(args) {
    const convertedArgs = [];
    for (let i = 0; i < args.length; i++) {
      convertedArgs[i] = this.fields[i].convert(args[i]);
      this.log(`  \u251C Converted "${args[i]}" to ${convertedArgs[i]}`);
    }
    return convertedArgs;
  }
  /**
   * Runs the function and get the execution result
   * @param args The arguments to run the function with
   * @returns The function result
   */
  async run(args) {
    await this.validate(args);
    return await this.callback.apply(this, this.convertArgs(args));
  }
  /**
   * Add a field to the function
   * @param name The field name
   * @param type The field type
   * @param description The field description (shown in help)
   * @param validation The field validation function
   * @returns this instance of InvokableFunction
   */
  addField(name, type, description, validation = void 0) {
    this.fields.push(new FunctionField(name, type, description, validation));
    return this;
  }
  /**
   * Add a field to the function
   * @param field The field (and validation) to add
   * @returns  this instance of InvokableFunction
   */
  addFunctionField(field) {
    this.fields.push(field);
    return this;
  }
  /**
   * Set the fields for the function
   * @param fields The fields to set
   */
  setFields(fields) {
    this.fields = [...fields];
  }
  /**
   * Get the fields for the function
   * @returns The fields
   */
  getFields() {
    return this.fields;
  }
  /**
   * Get a field by index
   * @param index
   * @returns
   */
  getFieldByIndex(index) {
    return this.fields[index];
  }
};

// lib/functioneer.ts
var Functioneer = class {
  /**
   * @param options FunctionRunnerOptions object  to override default options
   */
  constructor(options) {
    /**
     * The default options for the function runner
     */
    this.options = {
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
      showHelpOnError: true
    };
    //Contains all registered functions
    this.functions = {};
    if (options != void 0) {
      this.options = { ...this.options, ...options };
    }
  }
  /**
   * Helper function to get console logger based on debug option
   * @returns
   */
  getLog() {
    if (this.options.debug) {
      return console.log;
    }
    return () => {
    };
  }
  /**
   * Returns a successful result
   * @param result The result to return
   * @returns String or FunctionRunResult based on retrunJSONString option
   */
  returnSuccess(result) {
    if (this.options.returnJSONString) {
      return JSON.stringify({
        success: true,
        result
      });
    }
    return result + "";
  }
  /**
   * Returns an error result
   * @param message The error message to return
   * @returns String or FunctionRunResult based on retrunJSONString option
   */
  returnError(message) {
    if (this.options.returnJSONString) {
      return JSON.stringify({
        success: false,
        message
      });
    }
    return message + "";
  }
  /**
   * Registers a function
   * @param name The function name (must be unique)
   * @param description The function description to show in help
   * @param func The function to run
   */
  registerFunction(name, description, func) {
    this.functions[name] = {
      description,
      func: new InvokableFunction(func, this.getLog())
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
  registerFunctionWithSchema(name, description, func, schema) {
    this.functions[name] = {
      description,
      func: new InvokableFunction(func, this.getLog())
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
  getFunctionHelp(name) {
    if (this.functions[name] === void 0) {
      return `Function ${name} not found`;
    }
    let out = `Function ${name}:
`;
    let fields = this.functions[name].func.getFields();
    fields.forEach((field) => {
      out += `    ${field.getName()} (${field.getType()})	${field.getDescription()}
`;
    });
    return out;
  }
  /**
   * Returns help for all functions
   * @returns String
   */
  getHelp() {
    let out = "Syntax: <functionName> <arg1> <arg2> ... <argN>\n";
    out += "Functions:\n";
    for (let key in this.functions) {
      out += `- ${key} 	${this.functions[key].description} 
`;
      let fields = this.functions[key].func.getFields();
      fields.forEach((field) => {
        out += `	${field.getName()} (${field.getType()})	 ${field.getDescription()}
`;
      });
    }
    return out;
  }
  /**
   * Shows help for all functions in console
   * @returns
   */
  showHelp() {
    return console.log(this.getHelp());
  }
  /**
   * Runs a function with arguments from argv
   * @param argv The arguments array. argv[2] contains the function name and the rest of the array contains the function arguments
   * @returns String or FunctionRunResult based on retrunJSONString option
   */
  async runArgv(argv) {
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
  async runObj(obj) {
    if (obj.functionName === void 0) {
      return this.returnError("No functionName provided");
    }
    if (this.functions[obj.functionName] === void 0) {
      const notFoundLabel = `Function ${obj.functionName} not found ${this.options.showHelpOnError ? "\n\n" + this.getHelp() : ""}`;
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
  async run(name, args) {
    this.getLog()(`\xBB ${name} ${JSON.stringify(args)}`);
    if (this.functions[name] === void 0) {
      const notFoundLabel = `Function ${name} not found ${this.options.showHelpOnError ? "\n\n" + this.getHelp() : ""}`;
      return this.returnError(notFoundLabel);
    }
    let result;
    try {
      result = await this.functions[name].func.run(args);
    } catch (e) {
      const errorLabel = e + (this.options.showHelpOnError ? "\n\n" + this.getFunctionHelp(name) : "");
      return this.returnError(errorLabel);
    }
    if (result instanceof Uint8Array || result instanceof Object) {
      result = anyUint8ArrayToBase64(result);
    }
    return this.returnSuccess(result);
  }
};
export {
  FunctionField,
  Functioneer,
  InvokableFunction,
  Uint8ArrayToBase64,
  anyUint8ArrayToBase64,
  arrayToString,
  base64ToUint8Array,
  stringToArray,
  stringToBoolean,
  stringToNumber
};
//# sourceMappingURL=index.mjs.map