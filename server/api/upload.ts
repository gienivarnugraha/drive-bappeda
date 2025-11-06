import { sseSend } from '~/utils/sse'
import { clampCharacters } from '~/utils'
import useSupabaseStorage from '~/composables/useSupabaseStorage'
import supabase from '~/utils/supabase'

const allowedTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']

export default eventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw new Error('No files uploaded.')
  }

  const filenames: string[] = []

  const filenamesExists: string[] = []

  const storage = useSupabaseStorage('documents')

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

    if (await storage.hasItem(filename)) {
      if (file.name === 'file') {
        filenamesExists.push(filename)
      }

      sseSend('push:notif', { message: `file exists in storage... ${clampCharacters(filename)}`, status: 'info' })
    } else {
      sseSend('push:notif', { message: 'File upload started', status: 'info' })

      // const uploaded = await storage.setItem(filename, file.data)
      const { error } = await supabase.storage.from('documents').upload(filename, file.data, {
        upsert: true,
      });


      if (error) {
        console.log('file upload error: ', error)
        sseSend('push:notif', { message: `File ${clampCharacters(filename)} not uploaded `, status: 'error' })
      }

      if (file.name === 'file') {
        filenames.push(filename)
      }

      sseSend('push:notif', { message: `File ${clampCharacters(filename)} uploaded `, status: 'info' })
    }
  }

  if (filenames.length > 0) {
    sseSend('push:notif', { message: `${filenames.join(', ')} sucessfully uploaded...`, status: 'info' })

    return { message: `${filenames.length} files uploaded successfully`, filenames }
  } else {
    sseSend('push:notif', { message: `${filenamesExists.join(', ')} exists in storage...`, status: 'error' })

    throw createError({
      statusCode: 400,
      statusMessage: `${filenamesExists.join(', ')} exists in storage...`
    })
  }
})
