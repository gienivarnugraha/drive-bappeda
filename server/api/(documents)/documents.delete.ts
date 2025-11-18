import { inspect } from 'node:util'
import { clampFilename, sanitizeFileName } from '#shared/utils'
import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { sql } from 'drizzle-orm'
import { modifyRelation } from '~~/server/utils/db'

type Schema = {
    documentId: string
}

export default defineEventHandler(async (event) => {
    const payload = await readBody<Schema>(event)

    const { documentId } = payload

    const db = useDrizzle()

    try {
        await modifyRelation({ documentId: parseInt(documentId) }, 'delete')

        const document = await db.delete(tables.documents).where(eq(tables.documents.id, parseInt(documentId))).returning()

        const storage = useStorage('public')

        const filepath = `documents:${sanitizeFileName(document[0]?.filename as string, true)}`

        await storage.remove(`${filepath}:${document[0]?.filename as string}`)

        await storage.remove(`${filepath}:${sanitizeFileName(document[0]?.filename as string)}.png`)

        try {
            await db
                .delete(tables.documentsSummary)
                .where(sql`${tables.documentsSummary.metadata} ->> 'source_id' = ${document[0]?.uuid}`)

            return { message: `Success Delete summary: ${clampFilename(document[0]?.filename as string)}` }

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