import { join, resolve } from 'path'

/**
 * Resolves a storage path for a given key.
 * Replaces all ':' characters with '/'.
 * @param {string} key - The key to resolve the storage path for.
 * @returns {string} - The resolved storage path. 
 * @example resolveStoragePath('documents:folder:file.ext') // returns E://path/to/storage/documents/folder/file.ext
 */
export function resolveStoragePath(key: string): string {
    const base = resolve(process.env.STORAGE_PATH as string);
    return join(base, key.replace(/:/g, "/"));
}
