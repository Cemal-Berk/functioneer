/**
 * Convert a Uint8Array to a base64 encoded string
 * @param input The Uint8Array
 * @returns
 */
export function anyUint8ArrayToBase64(
  input: Object | Uint8Array | unknown
): string | unknown {
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

/**
 * Convert a numberic string to a number
 * @param str The numeric string
 * @returns number
 */
export function stringToNumber(str: string): number {
  return parseInt(str);
}
/**
 * Convert a boolean ("true","false" case insensitive) string to a boolean
 * @param str The boolean string
 * @returns boolean
 */
export function stringToBoolean(str: string): boolean {
  return str.toLowerCase() === "true";
}
/**
 * Convert a JSON string array "[1,2,3,"hello",4]" to an array
 * @param str The JSON string array
 * @returns The array
 */
export function stringToArray(str: string): any[] {
  return JSON.parse(str);
}
/**
 * Convert an array [1,2,3,"test"] to a JSON string
 * @param arr The array
 * @returns The JSON string
 */
export function arrayToString(arr: any[]): string {
  return JSON.stringify(arr);
}
/**
 * Convert a Uint8Array to a base64 encoded string
 * @param bytes The Uint8Array
 * @returns
 */
export function Uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert a base64 encoded string to a Uint8Array
 * @param base64
 * @returns
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}
