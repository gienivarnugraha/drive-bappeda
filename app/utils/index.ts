

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export function toUpperCase(str: string): string {
  return str.toUpperCase();
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
