import type { Category, Division, Document } from '~/types'
import { inspect } from 'node:util'
import { getClampedFileNameWithExtension, sanitizeFileName } from '~/utils'
import { serverSupabaseClient } from '#supabase/server'

type Schema = {
    documentId: string
}

export default defineEventHandler(async (event) => {
    const payload = await readBody<Schema>(event)

    const storage = useStorage(process.env.STORAGE_NAME)

    const { documentId } = payload

    const supabase = await serverSupabaseClient(event)

    // Logic for Deletion
    const { data: document, error: documentError } = await supabase
        .from('documents')
        .delete()
        .eq('id', parseInt(documentId))
        .select()
        .limit(1)
        .single()


    if (documentError) {
        console.error(`error Delete file: ${inspect(documentError, true, null, true)}`)

        throw createError({
            statusCode: 400,
            statusMessage: `Error Delete document:  ${documentError}`
        })
    }


    const thumbnailSrc = `${sanitizeFileName(document.filename)}.png`

    await storage.remove(document.filename)

    await storage.remove(thumbnailSrc)

    const { error: summaryError } = await supabase
        .from('documents_summary')
        .delete()
        .eq('metadata->>source_id', document.uuid as string)

    if (summaryError) {
        console.error(`error Delete summary: ${inspect(summaryError, true, null, true)}`)

        throw createError({
            statusCode: 400,
            statusMessage: `Error Delete summary:  ${summaryError}`
        })
    }

    return { message: `Success Delete file: ${getClampedFileNameWithExtension(document.filename)}` }
})