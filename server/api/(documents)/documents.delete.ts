import { inspect } from 'node:util'
import { getClampedFileNameWithExtension, sanitizeFileName } from '#shared/utils'
import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { sql } from 'drizzle-orm'

type Schema = {
    documentId: string
}

export default defineEventHandler(async (event) => {
    const payload = await readBody<Schema>(event)

    const { documentId } = payload

    const db = useDrizzle()

    try {
        const document = await db.delete(tables.documents).where(eq(tables.documents.id, parseInt(documentId))).returning()

        const storage = useStorage('public')

        const filepath = `documents:${sanitizeFileName(document[0].filename, true)}`

        await storage.remove(`${filepath}:${document[0].filename}`)

        await storage.remove(`${filepath}:${sanitizeFileName(document[0].filename)}.png`)

        try {
            await db
                .delete(tables.documentsSummary)
                .where(sql`${tables.documentsSummary.metadata} ->> 'source_id' = ${document[0].uuid}`)

            return { message: `Success Delete summary: ${getClampedFileNameWithExtension(document[0].filename)}` }

        } catch (summaryError: any) {

            console.error(`error Delete summary: ${inspect(summaryError, true, null, true)}`)

            throw createError({
                statusCode: 400,
                statusMessage: `Error Delete summary:  ${summaryError.message}`
            })
        }

    } catch (docerror: any) {
        console.error(`error Delete file: ${inspect(docerror, true, null, true)}`)

        throw createError({
            statusCode: 400,
            message: `Error Delete document:  ${docerror.message}`
        })
    }

})