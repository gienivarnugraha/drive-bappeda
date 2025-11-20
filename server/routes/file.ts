import { useStorage } from '#imports';
import { getMimeType } from '#shared/utils';

type Query = {
  filename: string,
}

export default defineEventHandler(async (event) => {
  const { filename } = getQuery<Query>(event)

  const storage = useStorage(process.env.STORAGE_KEY);

  const exists = await storage.has(filename);

  console.log('find: ', filename, 'exists:', exists)

  if (!exists) {
    return createError({
      statusCode: 404,
      message: `File **${filename}** not found`,
    })
  }
  // 3. Get the file content (as a Buffer)
  // We use getItem() or getRaw() to retrieve the binary content.
  const fileContent = await storage.getItemRaw<Buffer>(filename);

  // 4. Determine and Set the Content-Type header
  // This is crucial for the browser to correctly interpret the response as an image.
  setHeader(event, 'Content-Type', getMimeType(filename));

  // Optional: Set caching headers for better performance
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');

  // 5. Return the raw file content
  // Nitro/h3 will automatically handle streaming the Buffer/Blob content to the client.
  return fileContent;

});
