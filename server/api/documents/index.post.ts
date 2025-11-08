import { sseSend } from '~/utils/sse'
import { setVectorStore } from '~~/server/utils/init'
import type { DocumentMetadata, Document } from '~/types'
import { sanitizeFileName } from '~/utils'
import { extname } from 'node:path'
import { inspect } from 'node:util'
import { serverSupabaseClient } from '#supabase/server'



type Schema = {
    categories: number[]
    divisions: number[]
    filenames: string[]
}


export default defineEventHandler(async (event) => {
    const payload = await readBody<Schema>(event)

    const storage = useStorage(process.env.STORAGE_NAME)

    const { filenames, categories, divisions } = payload

    const supabase = await serverSupabaseClient(event)

    const processFiles: string[] = []

    const { data, error } = await supabase
        .from('documents')
        .select()
        .in('filename', filenames)

    if (data) {
        const existingFiles = new Set(data.map(file => file.filename));

        // It keeps only the elements from array1 for which the callback returns true.
        // Keep the item only IF set2 DOES NOT have it.
        const difference = filenames.filter(item => !existingFiles.has(item))

        processFiles.push(...difference)
    }

    console.log('processFiles', processFiles)

    if (error) {
        console.error('error confirming files', error)
    }

    if (processFiles.length === 0) {
        sseSend('push:notif', { message: `${filenames.join(', ')} already processed...`, status: 'success' })
        sseSend('close')
    }

    for (const filename of processFiles) {
        const meta = await storage.getMeta(filename)

        const metadata = {
            category_id: categories,
            division_id: divisions,
            filename: meta.pathname as string,
            fileSize: meta.size as number,
            contentType: meta.contentType as string,
            extension: extname(filename),
            thumbnailSrc: `${sanitizeFileName(filename)}.png`,
        } as DocumentMetadata

        await setVectorStore(`${meta.url}`, metadata)
    }

    sseSend('close')
})