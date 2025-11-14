import type { User } from '#shared/types';
import { inspect } from 'node:util';
import { sanitizeUrl, sanitizeFileName } from '~~/shared/utils';

// Define expected query types
interface UploadQuery {
  id: string;
  name: string;
}

export default eventHandler(async (event) => {
  // Input Retrieval and Validation
  const formData = await readMultipartFormData(event);
  const query = getQuery<UploadQuery>(event);

  // Destructure and ensure required inputs are present
  const { id, name } = query;

  const avatarFile = formData?.[0];

  if (!id || !name) {
    throw createError({
      statusCode: 400,
      message: 'Missing required query parameters: id and name.',
    });
  }

  if (!avatarFile || !avatarFile.data) {
    throw createError({
      statusCode: 400,
      message: 'No avatar file data found in form submission.',
    });
  }
  const config = useRuntimeConfig()

  const storage = useStorage(config.public.avatarUrl)

  try {
    // Upload Operation
    // setItemRaw is appropriate for Buffer/Blob data from multipart form
    await storage.setItemRaw(id, avatarFile.data);

    // Optional: Log the result of the storage item (e.g., its metadata)
    const storedItem = await storage.getItem(id);
    console.log(`Stored item for ID ${id}:`, storedItem);


    const url = sanitizeUrl(`/avatars/${id}`);

    // Success Response
    return {
      message: `Successfully uploaded avatar for: ${name}`,
      data: {
        url
      }, // This is often undefined or simple confirmation from storage drivers
    };

  } catch (error: any) {
    // Unified Error Handling

    // Log detailed error information
    console.error(`❌ Error uploading avatar for ${id} (${name}): ${inspect(error, true, null, true)}`);

    // Re-throw a standardized Nitro error
    throw createError({
      statusCode: 400,
      message: `Error upload avatar: ${error.message}`,
    });
  }
});