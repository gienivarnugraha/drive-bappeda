import { sseSend } from '~~/server/utils/sse'
import { processDocument } from '~~/server/utils/init'
import type { DocumentMetadata, Document } from '#shared/types'
import { sanitizeFileName } from '#shared/utils'
import { extname } from 'node:path'
import { useDrizzle, tables } from '#imports'
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

        console.log('processFiles', processFiles)

        if (processFiles.length === 0) {
            sseSend('push:notif', { message: `${filenames.join(', ')} already processed...`, status: 'success' })
            sseSend('close')
        }

        for (const filename of processFiles) {

            const storage = useStorage(`documents:${sanitizeFileName(filename, true)}`)

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

            await processDocument(`${meta.url}`, metadata)
        }

        sseSend('close')
    } catch (error) {

        console.error('error confirming files', error)
    }


})