
import {
    defineDriver,
    normalizeKey,
    joinKeys,
} from "unstorage";
import supabase from '~/utils/supabase'

// Note: Replace './utils/index.ts' and '@supabase/supabase-js' with the actual paths/packages in your project.

export interface SupabaseStorageOptions {
    /**
     * The name of the Supabase Storage bucket to use. (required)
     */
    bucketName: string;

    /**
     * Prefix to prepend to all keys. Can be used for namespacing.
     */
    base?: string;
}

const DRIVER_NAME = "supabase-storage";

export default defineDriver<SupabaseStorageOptions>((opts) => {
    const optsBase = normalizeKey(opts?.base);
    const client = supabase.storage;
    const storage = client.from(opts.bucketName)

    // Helper to construct the full path for the Supabase object
    const r = (key: string) => joinKeys(optsBase, key);

    // Helper to fetch object metadata (Supabase does not have a direct 'get' by key for content)
    const getObjectMeta = async (key: string) => {
        const objectPath = r(key);
        const { data: listData, error: listError } = await storage.list(
            // The prefix here is used to filter by the file name within the directory
            objectPath.substring(0, objectPath.lastIndexOf('/')),
            {
                search: objectPath.substring(objectPath.lastIndexOf('/') + 1)
            }
        );

        if (listError) throw listError;
        if (!listData || listData.length === 0) return null;

        // Supabase returns a list even for an exact path match with a prefix
        const object = listData.find((item) => r(item.name) === objectPath);

        if (!object) return null;

        // Supabase returns limited metadata in 'list', so we use a dummy 'getPublicUrl' 
        // for the full object path which might be useful, though not strictly metadata.
        const { data: publicUrlData } = storage.getPublicUrl(objectPath);

        // Supabase list data provides some metadata
        return {
            // mtime: new Date(object.created_at), // Using created_at as a timestamp
            // For simplicity, we just return what 'list' gives
            ...object,
            publicUrl: publicUrlData?.publicUrl,
        };
    };

    return {
        name: DRIVER_NAME,
        options: opts,

        // Check if an item exists
        async hasItem(key) {
            const { data, error } = await storage.exists(key)
            if (error) {
                throw error;
            }
            return data
        },

        // Get item as text
        async getItem(key) {
            const objectPath = r(key);
            const { data, error } = await storage.download(objectPath);
            if (error) {
                // Supabase returns a 404 error if the file is not found
                if (error.message.includes('not found')) return null;
                throw error;
            }
            if (!data) return null;
            return new Response(data).text();
        },

        // Get item as raw ArrayBuffer
        async getItemRaw(key) {
            const objectPath = r(key);
            const { data, error } = await storage.download(objectPath);
            if (error) {
                if (error.message.includes('not found')) return null;
                throw error;
            }
            return data; // Supabase download returns Blob, which can be an ArrayBuffer
        },

        // Get metadata
        async getMeta(key) {
            return getObjectMeta(key);
        },

        // Set item (Supabase uses 'upload' which is closer to 'put' with options)
        async setItem(key, value, setOptions) {
            const objectPath = r(key);
            // Supabase upload requires a File or Blob, so we convert the value
            const blob = new Blob([value], { type: setOptions?.contentType || 'text/plain' });

            // Use 'upsert: true' to overwrite existing file
            const { error } = await storage.upload(objectPath, blob, {
                upsert: true,
                // cacheControl is an option for Supabase upload
                cacheControl: setOptions?.cacheControl,
            });

            if (error) throw error;
        },

        // Set item raw (Assuming value is already a Blob/File/ArrayBuffer)
        async setItemRaw(key, value, setOptions) {
            const objectPath = r(key);

            // Supabase upload can take an ArrayBuffer (after converting to Blob)
            const blob = value instanceof Blob ? value : new Blob([value], { type: setOptions?.contentType || 'application/octet-stream' });

            // Use 'upsert: true' to overwrite existing file
            const { error } = await storage.upload(objectPath, blob, {
                upsert: true,
                cacheControl: setOptions?.cacheControl,
            });

            if (error) throw error;
        },

        // Remove item
        async removeItem(key) {
            const objectPath = r(key);
            // Supabase remove takes an array of object paths
            const { error } = await storage.remove([objectPath]);
            // Note: Supabase remove does not fail if the object doesn't exist.
            if (error) throw error;
        },

        // Get all keys under a base path
        async getKeys(base) {
            const prefix = r(base);
            // Supabase list can list objects in a folder (base) but not recursively by default.
            // We will assume a flat structure for simplicity like the Vercel Blob driver's key return.
            const { data, error } = await storage.list(prefix, {
                limit: 1000, // Max list limit in Supabase is 1000
                search: prefix, // Can be used to filter by prefix
                // Add options for pagination if more than 1000 items are expected
            });

            if (error) throw error;

            return data
                .filter((item) => item.name !== undefined) // Filter out folder objects if they exist in list
                .map((item) => {
                    // Remove the base prefix and any leading/trailing slashes
                    let key = joinKeys(prefix, item.name);
                    return key.substring(optsBase.length).replace(/^\/|\/$/g, '');
                });
        },

        // Clear all items under a base path
        async clear(base) {
            const prefix = r(base);

            const { data, error } = await client.emptyBucket(prefix);

            if (error) throw error;

        },
    };
});

