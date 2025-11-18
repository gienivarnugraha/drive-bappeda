import { sseSend } from '~~/server/utils/sse'
import { getClampedFileNameWithExtension, sanitizeFileName } from '#shared/utils'

const allowedTypes = ['application/pdf', 'text/plain', 'image/png']

export default eventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw new Error('No files uploaded.')
  }

  const filenames: string[] = []

  for (const file of formData) {
    if (!file.type || !allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        message:
          `File type ${file.type || 'unknown'} not allowed. 
              Allowed types: ${allowedTypes.join(', ')}`
      })
    }

    const filename = file.filename as string

    const storage = useStorage('public')

    if (file.name === 'file') {
      filenames.push(filename)
    }

    const filepath = `documents:${sanitizeFileName(filename, true)}:${filename}`

    if (await storage.hasItem(filepath)) {
      sseSend('push:notif', { message: `${getClampedFileNameWithExtension(filename)} exists in storage... `, status: 'info' })

    } else {
      sseSend('push:notif', { message: `${getClampedFileNameWithExtension(filename)} upload started`, status: 'info' })

      try {
        await storage.setItemRaw(filepath, file.data)

        sseSend('push:notif', { message: `${filenames.join(', ')} sucessfully uploaded...`, status: 'info' })

      } catch (error) {
        console.error('Error uploading file:', error)

        sseSend('push:notif', { message: `File ${getClampedFileNameWithExtension(filename)} not uploaded `, status: 'error' })
      }

      sseSend('push:notif', { message: `File ${getClampedFileNameWithExtension(filename)} uploaded `, status: 'info' })
    }
  }


  return { message: `${filenames.length} files uploaded successfully`, filenames }
})
