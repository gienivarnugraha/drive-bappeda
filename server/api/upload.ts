import { sseSend } from '~~/server/utils/sse'
import { clampFilename, sanitizeFileName } from '#shared/utils'
import { ALLOWED_MIME_TYPES } from '#shared/utils'

export default eventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw new Error('No files uploaded.')
  }

  const filenames: string[] = []

  for (const file of formData) {
    if (!file.type || !ALLOWED_MIME_TYPES('documents').includes(file.type)) {
      throw createError({
        statusCode: 400,
        message:
          `File type ${file.type || 'unknown'} not allowed. 
              Allowed types: ${ALLOWED_MIME_TYPES('documents').join(', ')}`
      })
    }


    const filename = sanitizeFileName(file.filename as string, false)
    const dirname = sanitizeFileName(file.filename as string)

    const storage = useStorage(process.env.STORAGE_KEY)

    if (file.name === 'file') {
      filenames.push(filename)
    }

    const filepath = `documents:${dirname}:${filename}`

    console.log(filepath)

    if (await storage.hasItem(filepath)) {
      sseSend('push:notif', { message: `${clampFilename(filename)} exists in storage... `, status: 'info' })

    } else {
      sseSend('push:notif', { message: `${clampFilename(filename)} upload started`, status: 'info' })

      try {
        await storage.setItemRaw(filepath, file.data)

        sseSend('push:notif', { message: `${filenames.join(', ')} sucessfully uploaded...`, status: 'info' })

      } catch (error) {
        console.error('Error uploading file:', error)

        sseSend('push:notif', { message: `File ${clampFilename(filename)} not uploaded `, status: 'error' })
      }

      sseSend('push:notif', { message: `File ${clampFilename(filename)} uploaded `, status: 'info' })
    }
  }


  return { message: `${filenames.length} files uploaded successfully`, filenames }
})
