import { sseSend } from '~/utils/sse'
import { setVectorStore } from '~/utils/scripts/init'
import type { DocumentMetadata } from '~/types'
import { sanitizeFileName } from '~/utils'
import { extname } from 'node:path'
import { inspect } from 'node:util'


type Schema = {
    categories: number[]
    divisions: number[]
    filenames: string[]
}


export default defineEventHandler(async (event) => {
    const data = await readBody<Schema>(event)

    const storage = useStorage(process.env.STORAGE_NAME)

    const { filenames, categories, divisions } = data

    for (const filename of filenames) {
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