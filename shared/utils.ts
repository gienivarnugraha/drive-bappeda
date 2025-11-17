import type { UserSession, RefreshTokenEntry } from '#shared/types';
import { SignJWT } from 'jose'

// Map to store Refresh Tokens securely in-memory (for simple cases).
// In a real app, this should be a persistent store like Redis or a Database.
// The key is the Refresh Token string, and the value is the token entry.
export const refreshTokensStore: Record<string, RefreshTokenEntry> = {};

export const getAccessToken = async (data: UserSession) => {
    const secret = new TextEncoder().encode(process.env.NUXT_AUTH_SESSION)

    if (!secret) {
        // Handle the case where the secret is not defined (CRITICAL ERROR)
        throw new Error('NUXT_AUTH_SESSION environment variable is not defined.');
    }

    const accessToken = await new SignJWT(data).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('2h').sign(secret)

    const refreshToken = Math.floor(Math.random() * (1000000000000000 - 1 + 1)) + 1
    // 4. Store the Refresh Token and its associated data
    refreshTokensStore[refreshToken] = {
        accessToken, // Note: Storing the associated access token here is common for linking
        data
    };

    return {
        accessToken,
        refreshToken
    }
}

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}


export function randomFrom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]!
}

export function dateToLocale(date: string | null) {
    if (date) {
        return new Date(date).toLocaleDateString()
    } else {
        return ''
    }
}

export const stringToNumberArray = (input: string[] | string): number[] | undefined => {
    // 1. Handle null input immediately
    if (input === undefined || input.length === 0 || input.includes('0')) {
        return undefined
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
    // Remove double slashes (but not after a colon)
    // This uses a negative lookbehind `(?<!:)` to ensure the slashes are not preceded by a colon.
    let sanitized = url.replace(/(?<!:)\/{2,}/g, '/')

    // Add a trailing slash if one does not exist
    // The regex /[^/]$/ matches any character that is NOT a slash, when it is at the end ($) of the string.
    // We use this to identify URLs that are missing the trailing slash.
    // if (sanitized.match(/[^/]$/)) {
    //   sanitized += '/'
    // }

    return sanitized
}


export function clampCharacters(text: string, limit: number = 25) {
    if (text === null || text === undefined) {
        return ''
    }
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

export const deepClone = (object: any) => object && JSON.parse(JSON.stringify(object))


/**
 * Sanitizes a filename by removing whitespace and replacing with hyphens (-),
 * and removes the file extension.
 * 
 * @param {string} file - The file name to sanitize, e.g. "file object.pdf"
 * @param {booleam} removeExtension - should extension removed? 
 * @returns {string} The sanitized filename, e.g. "file-object"
 */
export function sanitizeFileName(file: string, removeExtension: boolean = true): string {
    file.toLowerCase()
        // Replace whitespace and other non-alphanumeric characters with hyphens (-)
        .replace(/[^a-z0-9-_]+/g, '-')
        // Remove leading and trailing hyphens
        .replace(/^-+|-+$/g, '')

    if (removeExtension) {
        return file
            // Remove file extension
            .replace(/\.[^/.]+$/, '')

    } else {
        return file
    }
}

export const toKebabCase = (str: string) => {
    if (!str) return str;

    // 1. Normalize CamelCase/PascalCase: Insert a hyphen before any capital letter
    //    that is followed by a lowercase letter, or not at the start of the string.
    //    This breaks up "myVariableName" into "my-Variable-Name".
    let tempStr = str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2');

    // 2. Normalize Separators: Replace any remaining underscores or multiple
    //    hyphens/spaces with a single hyphen.
    //    This converts "my_variable_name" or "my--variable" to "my-variable".
    tempStr = tempStr.replace(/[\s_]+/g, '-');

    // 3. Convert the entire string to lowercase and clean up any leading/trailing hyphens.
    return tempStr.toLowerCase().replace(/^-+|-+$/g, '');
};

export const toSnakeCase = (str: string) => {
    if (!str) {
        return str;
    }

    // 1. Replace all hyphens/spaces with underscores.
    // 2. Insert an underscore before any uppercase letter (if it's not already preceded by a hyphen or underscore).
    //    - $1: the matched character before the capital letter (e.g., 'a' in 'aB').
    //    - $2: the capital letter (e.g., 'B' in 'aB').
    // 3. Convert the entire string to lowercase.

    return str
        .replace(/[-\s]+/g, '_') // Replace hyphens and spaces with underscores
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // Insert underscore before a capital letter
        .toLowerCase();
}


export const toTitleCase = (str: string) => {
    if (!str) return str;

    // 1. Prepare for Spacing: Insert a space before capital letters that are not
    //    at the start of the string, and convert all non-alphanumeric separators
    //    (hyphens, underscores) into a single space.

    // Regex to separate words by inserting a space before an uppercase letter
    // followed by a lowercase letter (for camelCase).
    let tempStr = str.replace(/([A-Z])(?=[a-z])/g, ' $1');

    // Regex to replace any remaining non-word characters (like -, _, or extra spaces)
    // with a single space. The trim() removes leading/trailing spaces.
    tempStr = tempStr.replace(/[-_\s]+/g, ' ').trim();

    // 2. Title Case: Capitalize the first letter of every word.
    //    This works on the newly spaced string.
    return tempStr.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getClampedFileNameWithExtension = ((filename: string, limit: number = 20) => clampCharacters(sanitizeFileName(filename), limit) + '.' + getFileExtension(filename))

export const clampAndTitleCase = (name: string, limit: number = 10) => clampCharacters(toTitleCase(name), limit)

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


export async function getPdfData(url: string): Promise<null | Blob> {
    try {
        const response = await fetch(url);

        // 1. Check for success status
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 2. Get the response body as a Blob (binary data)
        const pdfBlob = await response.blob();

        return pdfBlob
    } catch (error) {
        console.error('Failed to fetch PDF due to CORS or network error:', error);
        // You might want to fall back to opening the link directly here
        return null;
    }
}


