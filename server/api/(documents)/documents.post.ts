import { sseSend } from '~~/server/utils/sse'
import { processDocument } from '~~/server/utils/process'
import type { DocumentMetadata } from '#shared/types'
import { sanitizeFileName } from '#shared/utils'
import { extname } from 'node:path'
import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { inArray } from 'drizzle-orm'



type Schema = {
    categories: number[]
    divisions: number[]
    filenames: string[]
}


export default defineEventHandler(async (event) => {
    const payload = await readBody<Schema>(event)

    const { filenames, categories, divisions } = payload

    const db = useDrizzle()

    const processFiles: string[] = []

    try {
        const data = await db.select().from(tables.documents).where(inArray(tables.documents.filename, filenames))

        if (data) {
            const existingFiles = new Set(data.map(file => file.filename));

            const difference = filenames.filter(item => !existingFiles.has(item))

            processFiles.push(...difference)
        }

        if (processFiles.length === 0) {
            sseSend('push:notif', { message: `${filenames.join(', ')} already processed...`, status: 'success' })
            sseSend('close')
        }

        console.log('process Files', processFiles)

        const config = useRuntimeConfig()

        for (const file of processFiles) {

            const storage = useStorage(config.STORAGE_KEY)

            const filename = sanitizeFileName(file as string, false)
            const dirname = sanitizeFileName(file as string)

            const meta = await storage.getMeta(`documents:${dirname}:${filename}`)

            console.log('meta:', filename, meta)

            const metadata = {
                category_id: categories,
                division_id: divisions,
                filename,
                filepath: `documents:${dirname}/${filename}`,
                fileSize: meta.size as number,
                // contentType: meta.contentType as string,
                extension: extname(filename),
                thumbnailSrc: `documents:${dirname}/${dirname}.png`,
            } as DocumentMetadata

            await processDocument(filename, metadata)
        }

        sseSend('close')
    } catch (error) {

        console.error('error confirming files', error)
    }


})