export const deepClone = (object: any) => object && JSON.parse(JSON.stringify(object))

export const ALLOWED_TYPES = {
    'avatars': {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'webp': 'image/webp',
    },
    'documents': {
        'png': 'image/png', //thumbnails
        'txt': 'txt/plain',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'csv': 'text/csv',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
}

export const ALLOWED_EXTENSION_TYPES = (type: 'avatars' | 'documents') => Object.keys(ALLOWED_TYPES[type])

export const ALLOWED_MIME_TYPES = (type: 'avatars' | 'documents') => Object.values(ALLOWED_TYPES[type])

/**
 * Simple helper function to determine MIME type based on file extension.
 * You might use a package like 'mime-types' in a real app.
 */
export function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    switch (ext) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'gif': return 'image/gif';
        case 'webp': return 'image/webp';
        case 'pdf': return 'application/pdf';
        case 'doc': return 'application/msword';
        case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'xls': return 'application/vnd.ms-excel';
        case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        default: return 'application/octet-stream';
    }
}


export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFrom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]!
}

/**
 * Converts a date string to a localized date string.
 * If the date string is null, returns an empty string.
 * @param {string | null} date - The date string to convert.
 * @returns {string} - The localized date string.
 */
export function dateToLocale(date: string | null) {
    if (date) {
        return new Date(date).toLocaleDateString()
    } else {
        return ''
    }
}

/**
 * Converts an array of strings to an array of numbers.
 * If the input is null, an empty array, or contains the string '0', returns undefined.
 * If the input is a single string, attempts to parse it as a number.
 * For arrays of strings, maps each string to a number using parseInt and filters out NaNs for robustness.
 * @param {string[] | string} input - Array of strings or single string to convert to numbers.
 * @returns {number[] | undefined} - Converted array of numbers, or undefined if input is invalid.
 */
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


/**
 * Trims a string to a specified length, appending an ellipsis if the string is longer than the limit.
 * If the string is null or undefined, an empty string is returned.
 * If the string is shorter than or equal to the limit, the original string is returned.
 * @param {string} text The string to trim.
 * @param {number} [limit=25] The maximum length of the string.
 * @returns {string} The trimmed string.
 */
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
 * Sanitizes a filename by removing whitespace and other non-alphanumeric characters, replacing
 * them with hyphens (-), and removing leading and trailing hyphens. If removeExtension is true (default),
 * the file extension is also removed.
 * @param {string} file The filename to sanitize.
 * @param {boolean} [removeExtension=true] default TRUE, If true, the file extension is also removed.
 * @returns {string} The sanitized filename.
 */
export function sanitizeFileName(file: string, removeExtension: boolean = true): string {
    const extension = getFileExtension(file)

    const sanitized = file
        // Remove leading and trailing whitespace
        .trim()
        // Change to lowercase
        .toLowerCase()
        // Remove extension from filename
        .replace(/\.[^/.]+$/, '')
        // Replace whitespace and other non-alphanumeric characters with hyphens (-)
        .replace(/[^a-z0-9-_]+/g, '-')
        // Remove leading and trailing hyphens
        .replace(/^-+|-+$/g, '')

    // Remove extension from filename
    return removeExtension ? sanitized : `${sanitized}.${extension}`
}

/**
 * Converts a string to kebab case.
 * 
 * Kebab case is a string transformation where every word is separated by a hyphen (-),
 * and all words are in lowercase.
 * This function is useful for converting strings like camelCase or PascalCase to kebab case.
 * 
 * @example
 * toKebabCase('myVariableName') // returns "my-variable-name"
 * @example
 * toKebabCase('my_variable_name') // returns "my-variable-name"
 * @example
 * toKebabCase('my--variable') // returns "my-variable"
 *
 * @param {string} str - The input string to be converted to kebab case.
 * @returns {string} The input string converted to kebab case.
 */
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

/**
 * Converts a given string to snake case.
 * 
 * Snake case is a string transformation in which the first letter of every word is
 * underscored and the entire string is converted to lowercase.
 * This function is useful for converting strings like camelCase or title case to snake case.
 * 
 * @param {string} str - The input string to be converted to snake case.
 * @returns {string} The input string converted to snake case.
 */

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


/**
 * Converts a given string to title case.
 * 
 * Title case is a string transformation in which the first letter of every word is capitalized.
 * This function is useful for converting strings like camelCase or snake_case to title case.
 * 
 * 1. Prepares for spacing: inserts a space before capital letters that are not at the start of the string,
 *    and converts all non-alphanumeric separators (hyphens, underscores) into a single space.
 * 2. Title case: capitalizes the first letter of every word.
 * 
 * @param {string} str - The input string to be converted to title case.
 * @returns {string} The input string converted to title case.
 */
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

/**
 * Returns a clamped file name with the extension.
 *
 * @param {string} filename - The original file name.
 * @param {number} [limit=20] - The maximum number of characters allowed in the file name. Defaults to 20.
 * @returns {string} The clamped file name with the extension.
 */
export const clampFilename = ((filename: string, limit: number = 20) => clampCharacters(sanitizeFileName(filename), limit) + '.' + getFileExtension(filename))

/**
 * Returns a clamped and title-cased string.
 *
 * @param {string} name - The original string.
 * @param {number} [limit=10] - The maximum number of characters allowed in the string. Defaults to 10.
 * @returns {string} The clamped and title-cased string.
 */
export const clampAndTitleCase = (name: string, limit: number = 10) => clampCharacters(toTitleCase(name), limit)

/**
 * Returns the file extension from a given filename.
 * If the filename does not contain a dot (.) or starts with a dot (like .gitignore),
 * an empty string is returned.
 * @param {string} filename The filename to extract the extension from.
 * @returns {string} The file extension (e.g., "pdf", "txt", etc.).
 */
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


/** 
 * Fetches a PDF from a given URL and returns it as a Blob (binary data)
 * If the fetch fails due to CORS or network error, it returns null
 * @deprecated NOT USED AT THE MOMENT
 * @param {string} url - The URL of the PDF to fetch
 * @returns {Promise<null | Blob>} A promise that resolves to a Blob containing the PDF data, or null if the fetch failed
 */
export async function getPdfDataFromFromHttp(url: string): Promise<null | Blob> {
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


