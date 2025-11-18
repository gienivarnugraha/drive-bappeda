import { inspect } from 'node:util';
import { getFileExtension } from '~~/shared/utils';
import { v4 as uuid } from 'uuid'

// Define expected query types
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

export default eventHandler(async (event) => {
  // Input Retrieval and Validation
  const formData = await readMultipartFormData(event);

  const query = getQuery<{ avatar: string }>(event);


  // Destructure and ensure required inputs are present
  const { avatar } = query;

  const avatarFile = formData?.[0];

  if (!ALLOWED_TYPES.includes(avatarFile?.type as string)) {
    throw createError({
      statusCode: 400,
      message: `Only ${ALLOWED_TYPES.join(', ')} files are allowed.`,
    });
  }

  if (!avatarFile || !avatarFile.data) {
    throw createError({
      statusCode: 400,
      message: 'No avatar file data found in form submission.',
    });
  }

  const storage = useStorage('public')

  try {
    if (avatar) {
      const exists = await storage.hasItem(`avatars:${avatar}`)

      if (exists) {
        await storage.removeItem(`avatars:${avatar}`)
      }
    }


    const filename = `${uuid()}.${getFileExtension(avatarFile.filename as string)}`

    try {
      // setItemRaw is appropriate for Buffer/Blob data from multipart form
      await storage.setItemRaw(`avatars:${filename}`, avatarFile.data);

    } catch (seterror: any) {
      console.error('set item error', seterror)
    }

    return {
      message: `Successfully uploaded avatar`,
      data: {
        filename
      },
    };

  } catch (error: any) {
    // Log detailed error information
    console.error(`❌ Error uploading avatar for: ${inspect(error, true, null, true)}`);

    // Re-throw a standardized Nitro error
    throw createError({
      statusCode: 400,
      message: `Error upload avatar: ${error.message}`,
    });
  }
});