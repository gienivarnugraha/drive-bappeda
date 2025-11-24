import { useStorage } from '#imports';
import { getMimeType } from '#shared/utils';

type Query = {
  filename: string,
}

export default defineEventHandler(async (event) => {
  const { filename } = getQuery<Query>(event)
  const config = useRuntimeConfig()
  const storage = useStorage(config.STORAGE_KEY);

  const exists = await storage.has(filename);

  console.log('find: ', filename, 'exists:', exists, 'mime: ', getMimeType(filename))

  if (!exists) {
    throw createError({
      statusCode: 404,
      message: `File ${filename} not found`,
    })
  }

  // Get the file content (as a Buffer)
  const fileContent = await storage.getItemRaw<Buffer>(filename);

  // Optional: Set caching headers for better performance
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');

  // Return the blob file content
  return new Blob([fileContent as BlobPart], { type: getMimeType(filename) });;

});
