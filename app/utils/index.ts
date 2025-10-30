

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

export function dateToLocale(date: string) {
  return new Date(date).toLocaleDateString()
}

export function toTitleCase(str: string): string {
  // The regex \w\S* matches:
  // \w - one word character (like 'h' or 'W')
  // \S* - followed by zero or more non-whitespace characters (like 'ello' or 'ORLD')
  return str.replace(/\w\S*/g, function (txt) {
    // 1. Capitalize the first character.
    const firstChar = txt.charAt(0).toUpperCase();

    // 2. Take the rest of the string (substr(1)) and leave it AS IS.
    const restOfString = txt.substr(1);

    return firstChar + restOfString;
  });
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
  const uuidRegex = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;

  // The .match() method returns an array of results or null if no match is found.
  const match = filename.match(uuidRegex);

  // If a match is found, the full matched string (the UUID) is at index 1
  // because we used capturing parentheses () around the entire pattern.
  // If no match is found, match is null.
  return match ? match[1] as string : filename;
}

export function base64ToArrayBuffer(data: string) {
  var input = data.substring(data.indexOf(',') + 1);
  var binaryString = window.atob(input);
  var binaryLen = binaryString.length;
  var bytes = new Uint8Array(binaryLen);
  for (var i = 0; i < binaryLen; i++) {
    var ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes;
};

export function getFilenameWithoutExtension(file: string) {
  const lastDotIndex = file.lastIndexOf('.');
  let fileNameWithoutExtension;

  if (lastDotIndex !== -1) {
    fileNameWithoutExtension = file.substring(0, lastDotIndex);
  } else {
    fileNameWithoutExtension = file; // No extension found
  }

  //  return name.toLowerCase()
  //   .replace(/\.[^/.]+$/, '')
  //   .replace(/[^a-z0-9-_]+/g, '-')
  //   .replace(/^-+|-+$/g, '')

  return fileNameWithoutExtension
}

export function getFileExtension(filename: string) {
  const lastDot = filename.lastIndexOf('.');

  // Check for edge cases: no dot found, or filename starts with a dot (like ".gitignore")
  if (lastDot === -1 || lastDot === 0) {
    return ""; // Return empty string for no extension or hidden files
  }

  // Extracts the substring starting from the character after the last dot
  return filename.substring(lastDot + 1);
}
/**
 * Converts a number of bytes into a human-readable file size string.
 * @param {number} bytes The file size in bytes.
 * @param {number} decimals The number of decimal places to include (default is 2).
 * @returns {string} The formatted file size string (e.g., "1.21 KB").
 */
export function formatBytes(bytes: number, decimals = 2) {
  // 1. Handle edge case of 0 bytes
  if (bytes === 0) return '0 Bytes';

  // 2. Define constants for calculation
  const k = 1024; // Base unit for binary prefixes (KiB, MiB, etc. or KB, MB, etc. based on convention)
  const dm = decimals < 0 ? 0 : decimals; // Ensure decimals is not negative
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  // 3. Calculate the index for the appropriate unit (logarithm base 1024)
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // 4. Calculate the formatted value and append the unit
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
