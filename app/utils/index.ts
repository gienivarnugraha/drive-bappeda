import type { Results } from "~/types"

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

export function dateToLocale(date: string) {
  return new Date(date).toLocaleDateString()
}

export const stringToNumberArray = (input: string[] | string): number[] | null => {
  // 1. Handle null input immediately
  if (input === undefined || input.length === 0 || input.includes('0')) {
    return null
  }
  // 2. Handle single string input
  if (typeof input === 'string') {
    return [parseInt(input)]
  }
  // Map and parse the array of strings
  const numberArray = input.map(item => parseInt(item))

  // Optional: Filter out NaNs if you only want valid numbers.
  // If you want to strictly convert ALL strings, you can remove this check.
  // For robustness, filtering is generally better.
  const filteredArray = numberArray.filter(item => !isNaN(item))

  return filteredArray
}

/**
 * Sanitizes a URL by removing double slashes, but preserves the ones in the protocol (e.g., "http://").
 * @param {string} url The URL to sanitize.
 * @returns {string} The sanitized URL.
 */
export function sanitizeUrl(url: string): string {
  if (!url) {
    return url
  }
  // Replace multiple slashes with a single slash, but not after a colon (to preserve http://).
  // This uses a negative lookbehind `(?<!:)` to ensure the slashes are not preceded by a colon.
  return url.replace(/(?<!:)\/{2,}/g, '/')
}


export function toTitleCase(str: string): string {
  // The regex \w\S* matches:
  // \w - one word character (like 'h' or 'W')
  // \S* - followed by zero or more non-whitespace characters (like 'ello' or 'ORLD')
  return str.replace(/\w\S*/g, function (txt) {
    // 1. Capitalize the first character.
    const firstChar = txt.charAt(0).toUpperCase()

    // 2. Take the rest of the string (substr(1)) and leave it AS IS.
    const restOfString = txt.substring(1)

    return firstChar + restOfString
  })
}

export function clampCharacters(text: string, limit: number = 25) {
  if (!text || text.length <= limit) {
    return text;
  }
  return text.substring(0, limit) + '...';
}

/**
 * Extracts the first standard UUID (Universally Unique Identifier) found in a string (like a filename).
 *
 * @param {string} filename The string to search within.
 * @returns {string } The extracted UUID string, or null if no UUID is found.
 */
export function getUuidFromFilename(filename: string): string {
  // Regex explanation:
  // [0-9a-fA-F]: Matches any hex character (0-9, a-f, A-F).
  // {8}-{4}-{4}-{4}-{12}: Defines the 8-4-4-4-12 pattern of a standard UUID.
  const uuidRegex = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/

  // The .match() method returns an array of results or null if no match is found.
  const match = filename.match(uuidRegex)

  // If a match is found, the full matched string (the UUID) is at index 1
  // because we used capturing parentheses () around the entire pattern.
  // If no match is found, match is null.
  return match ? match[1] as string : filename
}

export function base64ToArrayBuffer(data: string) {
  const input = data.substring(data.indexOf(',') + 1)
  const binaryString = window.atob(input)
  const binaryLen = binaryString.length
  const bytes = new Uint8Array(binaryLen)
  for (let i = 0; i < binaryLen; i++) {
    const ascii = binaryString.charCodeAt(i)
    bytes[i] = ascii
  }
  return bytes
};

export const deepClone = (object: any) => JSON.parse(JSON.stringify(object))

export async function getPdfData(url: string, returnBlob: boolean = false): Promise<string | null | Blob> {
  try {
    const response = await fetch(url);

    // 1. Check for success status
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 2. Get the response body as a Blob (binary data)
    const pdfBlob = await response.blob();

    if (returnBlob) {
      return pdfBlob
    } else {
      // 3. Create a local URL for the Blob object
      const blobUrl = URL.createObjectURL(pdfBlob);

      return blobUrl;

    }

  } catch (error) {
    console.error('Failed to fetch PDF due to CORS or network error:', error);
    // You might want to fall back to opening the link directly here
    return null;
  }
}

/**
 * Sanitizes a filename by removing whitespace and replacing with hyphens (-),
 * and removes the file extension.
 * 
 * @param {string} file - The file name to sanitize, e.g. "file object.pdf"
 * @returns {string} The sanitized filename, e.g. "file-object"
 */
export function sanitizeFileName(file: string): string {
  return file.toLowerCase()
    // Remove file extension
    .replace(/\.[^/.]+$/, '')
    // Replace whitespace and other non-alphanumeric characters with hyphens (-)
    .replace(/[^a-z0-9-_]+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
}

export const getClampedFileNameWithExtension = ((item: Results, limit: number = 20) => clampCharacters(sanitizeFileName(item.filename), limit) + item.metadata.extension)

export function getFileExtension(filename: string) {
  const lastDot = filename.lastIndexOf('.')

  // Check for edge cases: no dot found, or filename starts with a dot (like ".gitignore")
  if (lastDot === -1 || lastDot === 0) {
    return '' // Return empty string for no extension or hidden files
  }

  // Extracts the substring starting from the character after the last dot
  return filename.substring(lastDot + 1)
}
/**
 * Converts a number of bytes into a human-readable file size string.
 * @param {number} bytes The file size in bytes.
 * @param {number} decimals The number of decimal places to include (default is 2).
 * @returns {string} The formatted file size string (e.g., "1.21 KB").
 */
export function formatBytes(bytes: number, decimals = 2) {
  // 1. Handle edge case of 0 bytes
  if (bytes === 0) return '0 Bytes'

  // 2. Define constants for calculation
  const k = 1024 // Base unit for binary prefixes (KiB, MiB, etc. or KB, MB, etc. based on convention)
  const dm = decimals < 0 ? 0 : decimals // Ensure decimals is not negative
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  // 3. Calculate the index for the appropriate unit (logarithm base 1024)
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // 4. Calculate the formatted value and append the unit
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

import { z, type ZodRawShape, type ZodTypeAny } from 'zod';
export function mergeZodAdditionalFields(baseState: any, additionalFields: any) {

  // Defines the known Zod types we can support dynamically
  type ZodTypeKey = 'string' | 'number' | 'boolean';

  // Defines the expected structure for each field in additionalFields
  type DynamicFieldConfig = {
    zodType: ZodTypeKey;
    defaultValue: any; // Used for state initialization
  };

  type DynamicFieldsProp = Record<string, DynamicFieldConfig>;

  // --- Schema Definition ---

  const baseSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
  });

  /**
   * Converts the dynamic field configuration into the corresponding Zod schema shape
   * by selecting the correct Zod type (string, number, boolean, etc.).
   */
  const buildDynamicSchemaShape = (fields: DynamicFieldsProp): ZodRawShape => {
    const dynamicShape: ZodRawShape = {};

    for (const key in fields) {
      const config = fields[key];
      let zodValidator: ZodTypeAny;

      // Dynamically select the Zod validator based on the config.zodType
      switch (config?.zodType) {
        case 'number':
          // Use z.coerce.number() to allow form inputs (which are strings) to be converted
          zodValidator = z.coerce.number().optional();
          break;
        case 'boolean':
          zodValidator = z.boolean().optional();
          break;
        case 'string':
        default:
          zodValidator = z.string().optional();
          break;
      }

      // Assign the determined Zod validator to the dynamic shape
      dynamicShape[key] = zodValidator;
    }
    return dynamicShape;
  };

  // 1. Get the shape for the dynamic part
  const dynamicShape = buildDynamicSchemaShape(additionalFields);

  // 2. Create  Zod object for the additional fields
  const dynamicSchema = z.object(dynamicShape);

  // 3. Merge the base and dynamic schemas statically
  const finalSchema = baseSchema.merge(dynamicSchema);

  // Infer the complete, correct type
  return finalSchema;

}