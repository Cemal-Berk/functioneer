import {
  base64ToUint8Array,
  stringToArray,
  stringToBoolean,
  stringToNumber,
} from "./converters";
import { ValidationField } from "./interfaces";

/***
 * A field in a function
 */
export class FunctionField {
  private name: string;
  private type: ValidationField;
  private description: string | undefined;
  private validation:
    | ((fieldValue: string) => boolean | undefined)
    | ((fieldValue: string) => Promise<boolean | undefined>)
    | undefined;
  constructor(
    name: string,
    type: ValidationField,
    description: string | undefined,
    validation?:
      | ((fieldValue: string) => boolean)
      | ((fieldValue: string) => Promise<boolean>)
  ) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.validation = validation;
  }
  /**
   * Gets the field description for showing in help
   * @returns
   */
  public getDescription() {
    return this.description;
  }
  /**
   * Gets the field name for showing in help
   */
  public getName() {
    return this.name;
  }
  /**
   * Gets the field type for showing in help
   */
  public getType() {
    return this.type;
  }
  /**
   * Converts the field to the expected type
   * @param fieldValue The field value
   * @throws Error if the field value is invalid and cannot be converted
   * @returns the converted value
   */
  public convert(fieldValue: string): any {
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
  public async validate(fieldValue: string): Promise<boolean> {
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
        if (
          !(
            Array.isArray(JSON.parse(fieldValue)) &&
            JSON.parse(fieldValue).length > 0
          )
        ) {
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
      if (
        firstPaddingChar === -1 ||
        firstPaddingChar === len - 1 ||
        (firstPaddingChar === len - 2 && str[len - 1] === "=")
      ) {
        return true;
      }
      throw "Invalid base64 string for field " + this.name;
    }
    if (this.type == "custom") {
      if (this.validation == undefined) {
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
}
