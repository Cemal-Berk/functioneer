/**
 * Type of validation for a field
 */
export type ValidationField =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "base64UInt8Array"
  | "custom";

/**
 * Function run result
 */
export interface FunctionRunResult {
  success: boolean;
  result?: any;
  message?: string | undefined;
}

/**
 * Options for the function runner
 */
export interface FunctionRunnerOptions {
  returnJSONString?: boolean;
  showHelpOnError?: boolean;
  debug?: boolean;
}

/**
 * Function proxy schema item
 */
export interface FunctionProxySchemaItem {
  fieldName: string;
  fieldType:
    | "string"
    | "number"
    | "boolean"
    | "array"
    | "base64UInt8Array"
    | "custom";
}

/**
 * Used to call a function using an object
 */
export interface FunctionObjectCall {
  /** The name of the function to be called */
  functionName: string;
  [key: string]: string | number | boolean | object | Uint8Array | undefined;
}
