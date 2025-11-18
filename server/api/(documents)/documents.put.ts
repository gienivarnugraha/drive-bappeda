import type { Category, Division } from '#shared/types'
import { inspect } from 'node:util'
import { modifyRelation } from '~~/server/utils/db'
import { clampFilename } from '#shared/utils'
import { useDrizzle, tables } from '~~/server/utils/drizzle'

type Schema = {
    documentId: number
    categories: Category[]
    divisions: Division[]
    title?: string
    description?: string
}

export default defineEventHandler(async (event) => {
    const data = await readBody<Schema>(event)

    const { documentId, categories, divisions, ...rest } = data

    const categoryIds = categories.length ? categories.map(category => category.id) : []

    const divisionIds = divisions.length ? divisions.map(division => division.id) : []

    await modifyRelation({ documentId }, 'delete')

    // add the relation again after deleting
    await modifyRelation({ documentId, categoryIds, divisionIds }, 'edit')

    const db = useDrizzle()


    try {
        const response = await db
            .update(tables.documents)
            .set(rest)
            .where(eq(tables.documents.id, documentId))
            .returning()

        return { message: `Success Update file: ${clampFilename(rest.title || '')}`, data: response[0] }
    } catch (error: any) {

        console.error(`error Update file: ${inspect(error, true, null, true)}`)

        throw createError({
            statusCode: 400,
            message: `Error Update file:  ${error.message}`
        })
    }

})