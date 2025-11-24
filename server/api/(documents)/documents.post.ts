import { sseSend } from '~~/server/utils/sse'
import { processDocument } from '~~/server/utils/process'
import type { DocumentMetadata, FileMeta } from '#shared/types'
import { sanitizeFileName } from '#shared/utils'
import { extname } from 'node:path'
import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { inArray } from 'drizzle-orm'



type Schema = {
    categories: number[]
    divisions: number[]
    filesmeta: FileMeta[]
}


export default defineEventHandler(async (event) => {
    const payload = await readBody<Schema>(event)

    const { filesmeta, categories, divisions } = payload

    const db = useDrizzle()

    const processFiles: FileMeta[] = []

    const filenames = filesmeta.map(item => sanitizeFileName(item.name, false))

    try {
        const data = await db.select().from(tables.documents).where(inArray(tables.documents.filename, filenames))

        if (data) {
            const existingFiles = new Set(data.map(file => file.filename));

            const difference = filesmeta.filter(item => !existingFiles.has(item.name))

            processFiles.push(...difference)
        }

        if (processFiles.length === 0) {
            sseSend('push:notif', { message: `${filenames.join(', ')} already processed...`, status: 'success' })
            sseSend('close')
        }

        for (const file of processFiles) {

            const filename = sanitizeFileName(file.name as string, false)
            const dirname = sanitizeFileName(file.name as string)

            const metadata = {
                category_id: categories,
                division_id: divisions,
                filename,
                filepath: `documents:${dirname}:${filename}`,
                fileSize: file.size as number,
                contentType: file.type as string,
                createdAt: new Date(file.createdAt),
                extension: extname(filename),
                thumbnailSrc: `documents:${dirname}:${dirname}.png`,
            } as DocumentMetadata

            await processDocument(filename, metadata)
        }

        sseSend('close')
    } catch (error) {

        console.error('error confirming files', error)
    }


})