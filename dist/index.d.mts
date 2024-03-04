/**
 * Convert a Uint8Array to a base64 encoded string
 * @param input The Uint8Array
 * @returns
 */
declare function anyUint8ArrayToBase64(input: Object | Uint8Array | unknown): string | unknown;
/**
 * Convert a numberic string to a number
 * @param str The numeric string
 * @returns number
 */
declare function stringToNumber(str: string): number;
/**
 * Convert a boolean ("true","false" case insensitive) string to a boolean
 * @param str The boolean string
 * @returns boolean
 */
declare function stringToBoolean(str: string): boolean;
/**
 * Convert a JSON string array "[1,2,3,"hello",4]" to an array
 * @param str The JSON string array
 * @returns The array
 */
declare function stringToArray(str: string): any[];
/**
 * Convert an array [1,2,3,"test"] to a JSON string
 * @param arr The array
 * @returns The JSON string
 */
declare function arrayToString(arr: any[]): string;
/**
 * Convert a Uint8Array to a base64 encoded string
 * @param bytes The Uint8Array
 * @returns
 */
declare function Uint8ArrayToBase64(bytes: Uint8Array): string;
/**
 * Convert a base64 encoded string to a Uint8Array
 * @param base64
 * @returns
 */
declare function base64ToUint8Array(base64: string): Uint8Array;

/**
 * Type of validation for a field
 */
type ValidationField = "string" | "number" | "boolean" | "array" | "base64UInt8Array" | "custom";
/**
 * Function run result
 */
interface FunctionRunResult {
    success: boolean;
    result?: any;
    message?: string | undefined;
}
/**
 * Options for the function runner
 */
interface FunctionRunnerOptions {
    returnJSONString?: boolean;
    showHelpOnError?: boolean;
    debug?: boolean;
}
/**
 * Function proxy schema item
 */
interface FunctionProxySchemaItem {
    fieldName: string;
    fieldType: "string" | "number" | "boolean" | "array" | "base64UInt8Array" | "custom";
}
/**
 * Used to call a function using an object
 */
interface FunctionObjectCall {
    /** The name of the function to be called */
    functionName: string;
    [key: string]: string | number | boolean | object | Uint8Array | undefined;
}

/***
 * A field in a function
 */
declare class FunctionField {
    private name;
    private type;
    private description;
    private validation;
    constructor(name: string, type: ValidationField, description: string | undefined, validation: ((fieldValue: string) => boolean) | ((fieldValue: string) => Promise<boolean>) | undefined);
    /**
     * Gets the field description for showing in help
     * @returns
     */
    getDescription(): string;
    /**
     * Gets the field name for showing in help
     */
    getName(): string;
    /**
     * Gets the field type for showing in help
     */
    getType(): ValidationField;
    /**
     * Converts the field to the expected type
     * @param fieldValue The field value
     * @throws Error if the field value is invalid and cannot be converted
     * @returns the converted value
     */
    convert(fieldValue: string): any;
    /**
     * Validates the field value
     * @param fieldValue The value to validate
     * @returns Promis<Boolean>
     */
    validate(fieldValue: string): Promise<boolean>;
}

/**
 * An invokable function for use in the function runner
 */
declare class InvokableFunction {
    private fields;
    private callback;
    private log;
    constructor(callback: Function, log: Function);
    /**
     * Validate the argument passed to the function
     * @param args The arguments to validate
     * @throws Error if the arguments are invalid
     * @returns true if the arguments are valid
     */
    validate(args: any[]): Promise<boolean>;
    /**
     * Convert the arguments to the expected types
     * @param args The arguments to convert
     * @returns true if the arguments are valid
     */
    private convertArgs;
    /**
     * Runs the function and get the execution result
     * @param args The arguments to run the function with
     * @returns The function result
     */
    run(args: any[]): Promise<any>;
    /**
     * Add a field to the function
     * @param name The field name
     * @param type The field type
     * @param description The field description (shown in help)
     * @param validation The field validation function
     * @returns this instance of InvokableFunction
     */
    addField(name: string, type: ValidationField, description: string, validation?: ((fieldValue: string) => boolean) | ((fieldValue: string) => Promise<boolean>) | undefined): this;
    /**
     * Add a field to the function
     * @param field The field (and validation) to add
     * @returns  this instance of InvokableFunction
     */
    addFunctionField(field: FunctionField): this;
    /**
     * Set the fields for the function
     * @param fields The fields to set
     */
    setFields(fields: FunctionField[]): void;
    /**
     * Get the fields for the function
     * @returns The fields
     */
    getFields(): FunctionField[];
    /**
     * Get a field by index
     * @param index
     * @returns
     */
    getFieldByIndex(index: number): FunctionField;
}

/***
 * Main Functioneer class for running functions
 */
declare class Functioneer {
    /**
     * The default options for the function runner
     */
    options: FunctionRunnerOptions;
    /**
     * Helper function to get console logger based on debug option
     * @returns
     */
    private getLog;
    /**
     * Returns a successful result
     * @param result The result to return
     * @returns String or FunctionRunResult based on retrunJSONString option
     */
    private returnSuccess;
    /**
     * Returns an error result
     * @param message The error message to return
     * @returns String or FunctionRunResult based on retrunJSONString option
     */
    private returnError;
    /**
     * @param options FunctionRunnerOptions object  to override default options
     */
    constructor(options?: FunctionRunnerOptions);
    private functions;
    /**
     * Registers a function
     * @param name The function name (must be unique)
     * @param description The function description to show in help
     * @param func The function to run
     */
    registerFunction(name: string, description: string, func: Function): InvokableFunction;
    /**
     * Returns a function with a parameter schema
     * @param name The function name
     * @param description The function description to show in help
     * @param func The function to run
     * @param schema The function parameter schema
     * @returns
     */
    registerFunctionWithSchema(name: string, description: string, func: Function, schema: FunctionField[]): {
        description: string;
        func: InvokableFunction;
    };
    /**
     * Returns help for a function
     * @param name The function name
     * @returns string
     */
    getFunctionHelp(name: string): string;
    /**
     * Returns help for all functions
     * @returns String
     */
    getHelp(): string;
    /**
     * Shows help for all functions in console
     * @returns
     */
    showHelp(): void;
    /**
     * Runs a function with arguments from argv
     * @param argv The arguments array. argv[2] contains the function name and the rest of the array contains the function arguments
     * @returns String or FunctionRunResult based on retrunJSONString option
     */
    runArgv(argv: string[]): Promise<string | FunctionRunResult>;
    /**
     * Runs a function from a function object call
     * @param obj The function object call containing the functionName and all function arguements
     * @returns String on FunctionRunResult based on retrunJSONString option
     */
    runObj(obj: FunctionObjectCall): Promise<string | FunctionRunResult>;
    /**
     * Runs a function
     * @param name The function name
     * @param args The function arguments
     * @returns String on FunctionRunResult based on retrunJSONString option
     */
    run(name: string, args: any[]): Promise<string | FunctionRunResult>;
}

export { FunctionField, type FunctionObjectCall, type FunctionProxySchemaItem, type FunctionRunResult, type FunctionRunnerOptions, Functioneer, InvokableFunction, Uint8ArrayToBase64, type ValidationField, anyUint8ArrayToBase64, arrayToString, base64ToUint8Array, stringToArray, stringToBoolean, stringToNumber };
