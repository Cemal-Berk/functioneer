import { FunctionField } from "./function-field";
import { ValidationField } from "./interfaces";

/**
 * An invokable function for use in the function runner
 */
export class InvokableFunction {
  private fields: FunctionField[] = [];
  private callback: Function;
  private log: Function;
  constructor(callback: Function, log: Function) {
    this.callback = callback;
    this.log = log;
  }

  /**
   * Validate the argument passed to the function
   * @param args The arguments to validate
   * @throws Error if the arguments are invalid
   * @returns true if the arguments are valid
   */
  public async validate(args: any[]) {
    if (this.fields.length != args.length) {
      throw `Invalid number of arguments. Expected 
        ${this.fields.length} but got ${args.length}`;
    }
    for (let i = 0; i < args.length; i++) {
      if ((await this.fields[i].validate(args[i])) === false) {
        throw `Invalid argument value. Argument 
          ${this.fields[
            i
          ].getName()} at index ${i} did not pass validation for type ${this.fields[
          i
        ].getType()}`;
      }
    }
    return true;
  }

  /**
   * Convert the arguments to the expected types
   * @param args The arguments to convert
   * @returns true if the arguments are valid
   */
  private convertArgs(args: any[]) {
    const convertedArgs = [];
    for (let i = 0; i < args.length; i++) {
      convertedArgs[i] = this.fields[i].convert(args[i]);
      this.log(`  ├ Converted "${args[i]}" to ${convertedArgs[i]}`);
    }
    return convertedArgs;
  }

  /**
   * Runs the function and get the execution result
   * @param args The arguments to run the function with
   * @returns The function result
   */
  public async run(args: any[]) {
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
  public addField(
    name: string,
    type: ValidationField,
    description: string,
    validation:
      | ((fieldValue: string) => boolean)
      | ((fieldValue: string) => Promise<boolean>)
      | undefined = undefined
  ) {
    this.fields.push(new FunctionField(name, type, description, validation));
    return this;
  }
  /**
   * Add a field to the function
   * @param field The field (and validation) to add
   * @returns  this instance of InvokableFunction
   */
  public addFunctionField(field: FunctionField) {
    this.fields.push(field);
    return this;
  }
  /**
   * Set the fields for the function
   * @param fields The fields to set
   */
  public setFields(fields: FunctionField[]) {
    this.fields = [...fields];
  }
  /**
   * Get the fields for the function
   * @returns The fields
   */
  public getFields() {
    return this.fields;
  }
  /**
   * Get a field by index
   * @param index
   * @returns
   */
  public getFieldByIndex(index: number) {
    return this.fields[index];
  }
}
