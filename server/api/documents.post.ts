import { sseSend } from '../../app/utils/sse'
import { setVectorStore } from '~/utils/scripts/init'
import type { Document } from '~/types'
import { inspect } from 'node:util'
import { modifyRelation } from '~/utils/db'
import supabase from '~/utils/supabase'

type BaseSchema = {
  categories: number[]
  divisions: number[]
}

type EditSchema = {
  document: Document
  shouldDelete: boolean
} & BaseSchema

type PostSchema = {
  filenames: string[]
} & BaseSchema

const documentPath = process.env.DOCUMENT_PATH ?? ''

if (!documentPath) {
  throw new Error('DOCUMENT_PATH environment variable is not set.')
}

export default defineEventHandler(async (event) => {
  const data = await readBody<EditSchema | PostSchema>(event)

  const storage = useStorage('blobs')

  if ('shouldEdit' in data || 'shouldDelete' in data) {
    const { document, shouldDelete, categories, divisions } = data as EditSchema

    let request

    await modifyRelation({ document, categories, divisions }, 'delete')

    if (shouldDelete === true) {
      // Logic for Deletion
      request = supabase
        .from('documents')
        .delete()
        .eq('id', document.id) // Assuming document.id is the key

      await storage.remove(document.filename)
    } else {
      // throw categories and division
      const { categories: cat, divisions: div, ...payload } = document

      request = supabase
        .from('documents')
        .upsert(payload, { onConflict: 'id' })
        .eq('id', document.id)

      // add the relation again after deleting
      await modifyRelation({ document, categories, divisions }, 'edit')
    }

    const { data: result, error } = await request

    if (error) {
      console.error(`error ${shouldDelete ? 'Delete' : 'Update'} file: ${inspect(error, true, null, true)}`)

      throw createError({
        statusCode: 400,
        statusMessage: `Error ${shouldDelete ? 'Delete' : 'Update'} file:  ${error}`
      })
    } else {
      return { message: `Success ${shouldDelete ? 'Delete' : 'Update'} file: ${document.filename}` }
    }
  } else {
    const { filenames, categories, divisions } = data as PostSchema

    for (const filename of filenames) {
      const storageMeta = await storage.getMeta(filename)

      console.log('documents posts file metadata : ', storageMeta)

      await setVectorStore(`${storageMeta.url}`, { category_id: categories, division_id: divisions, storageMeta })
    }

    sseSend('close')
  }
})
