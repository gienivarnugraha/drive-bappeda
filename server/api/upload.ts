import { sseSend } from '~~/server/utils/sse'
import { getClampedFileNameWithExtension } from '#shared/utils'
import { serverSupabaseClient } from "#supabase/server";


const allowedTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']

export default eventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw new Error('No files uploaded.')
  }

  const filenames: string[] = []

  const storage = useStorage(process.env.STORAGE_NAME)

  for (const file of formData) {
    if (!file.type || !allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          `File type ${file.type || 'unknown'} not allowed. 
              Allowed types: ${allowedTypes.join(', ')}`
      })
    }

    const filename = file.filename as string


    if (file.name === 'file') {
      filenames.push(filename)
    }

    if (await storage.hasItem(filename)) {
      sseSend('push:notif', { message: `${getClampedFileNameWithExtension(filename)} exists in storage... `, status: 'info' })

    } else {
      sseSend('push:notif', { message: `${getClampedFileNameWithExtension(filename)} upload started`, status: 'info' })

      try {
        await storage.setItemRaw(filename, file.data)
      } catch (error) {
        console.error('Error uploading file:', error)
        sseSend('push:notif', { message: `File ${getClampedFileNameWithExtension(filename)} not uploaded `, status: 'error' })
      }

      sseSend('push:notif', { message: `File ${getClampedFileNameWithExtension(filename)} uploaded `, status: 'info' })
    }
  }

  sseSend('push:notif', { message: `${filenames.join(', ')} sucessfully uploaded...`, status: 'info' })

  return { message: `${filenames.length} files uploaded successfully`, filenames }
})
