import { join } from 'node:path'
import supabase from '~/utils/supabase'


type FileBody =
    | ArrayBuffer
    | ArrayBufferView
    | Blob
    | Buffer
    | File
    | FormData
    | NodeJS.ReadableStream
    | ReadableStream<Uint8Array>
    | URLSearchParams
    | string


interface FileOptions {
    /**
     * The number of seconds the asset is cached in the browser and in the Supabase CDN. This is set in the `Cache-Control: max-age=<seconds>` header. Defaults to 3600 seconds.
     */
    cacheControl?: string
    /**
     * the `Content-Type` header value. Should be specified if using a `fileBody` that is neither `Blob` nor `File` nor `FormData`, otherwise will default to `text/plain;charset=UTF-8`.
     */
    contentType?: string
    /**
     * When upsert is set to true, the file is overwritten if it exists. When set to false, an error is thrown if the object already exists. Defaults to false.
     */
    upsert?: boolean
    /**
     * The duplex option is a string parameter that enables or disables duplex streaming, allowing for both reading and writing data in the same stream. It can be passed as an option to the fetch() method.
     */
    duplex?: string

    /**
     * The metadata option is an object that allows you to store additional information about the file. This information can be used to filter and search for files. The metadata object can contain any key-value pairs you want to store.
     */
    metadata?: Record<string, any>

    /**
     * Optionally add extra headers
     */
    headers?: Record<string, string>
}



export default function (bucketName: string, base?: string) {
    /** 
     * Discard the query string.Convert all slashes (/ and \) to colons (:).
     * Ensure only a single colon separates segments.
     * Remove any leading or trailing colons.
     * Return an empty string if the input was empty.
     * example Input (key) 
     * "/a/b/c.txt?v=1"a/b/c.txt → a:b:c.txt    -> a:b:c.txt"
     * \\foo//bar\\"\foo//bar\   → :foo::bar:   -> foo:bar 
     */
    const client = supabase.storage;
    const storage = client.from(bucketName)

    // Helper to fetch object metadata (Supabase does not have a direct 'get' by key for content)
    const getObjectMeta = async (key: string) => {
        const { data: listData, error: listError } = await storage.list(
            // The prefix here is used to filter by the file name within the directory
            key.substring(0, key.lastIndexOf('/')),
            {
                search: key.substring(key.lastIndexOf('/') + 1)
            }
        );

        if (listError) throw listError;
        if (!listData || listData.length === 0) return null;

        // Supabase returns a list even for an exact path match with a prefix
        const object = listData.find((item) => item.name === key);

        if (!object) return null;

        // Supabase returns limited metadata in 'list', so we use a dummy 'getPublicUrl' 
        // for the full object path which might be useful, though not strictly metadata.
        const { data: publicUrlData } = storage.getPublicUrl(key);

        // Supabase list data provides some metadata
        return {
            // mtime: new Date(object.created_at), // Using created_at as a timestamp
            // For simplicity, we just return what 'list' gives
            ...object,
            publicUrl: publicUrlData?.publicUrl,
        };
    };

    return {
        // Check if an item exists
        async hasItem(key: string) {
            const { data, error } = await storage.exists(key)
            if (error) {
                throw error;
            }
            return data
        },

        // Get item as text
        async getItem(key: string) {
            const { data, error } = await storage.download(key);
            if (error) {
                // Supabase returns a 404 error if the file is not found
                if (error.message.includes('not found')) return null;
                throw error;
            }

            if (!data) return null;

            return data
        },

        // Get metadata
        async getMeta(key: string) {
            return getObjectMeta(key);
        },

        // Set item (Supabase uses 'upload'  with options)
        async setItem(key: string, value: FileBody, setOptions?: FileOptions) {

            // Use 'upsert: true' to overwrite existing file
            const { error } = await storage.upload(key, value, {
                upsert: true,
                // cacheControl is an option for Supabase upload
                cacheControl: setOptions?.cacheControl,
            });

            if (error) throw error;

            return true
        },

        // Remove item
        async removeItem(key: string) {
            // Supabase remove takes an array of object paths
            const { error } = await storage.remove([key]);
            // Note: Supabase remove does not fail if the object doesn't exist.
            if (error) throw error;

        },

        // Get all keys under a base path
        async getKeys(base: string) {
            // Supabase list can list objects in a folder (base) but not recursively by default.
            // We will assume a flat structure for simplicity like the Vercel Blob driver's key return.
            const { data, error } = await storage.list(base, {
                limit: 1000, // Max list limit in Supabase is 1000
                search: base, // Can be used to filter by base
                // Add options for pagination if more than 1000 items are expected
            });

            if (error) throw error;

            return data
                .filter((item) => item.name !== undefined) // Filter out folder objects if they exist in list
                .map((item) => {
                    // Remove the base base and any leading/trailing slashes
                    let key = join(base, item.name);
                    return key.substring(base.length).replace(/^\/|\/$/g, '');
                });
        },

        // Clear all items under a base path
        async clear(key: string) {
            const { data, error } = await client.emptyBucket(key);

            if (error) throw error;
        },


    };
};

