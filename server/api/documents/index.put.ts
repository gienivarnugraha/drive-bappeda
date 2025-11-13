import type { Document, Category, Division } from '#shared/types'
import { inspect } from 'node:util'
import { modifyRelation } from '~~/server/utils/db'
import { getClampedFileNameWithExtension } from '#shared/utils'
import { useDrizzle, tables } from '#imports'

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
        await db
            .update(tables.documents)
            .set(rest)
            .where(eq(tables.documents.id, documentId))

        return { message: `Success Update file: ${getClampedFileNameWithExtension(rest.title || '')}` }
    } catch (error: any) {

        console.error(`error Update file: ${inspect(error, true, null, true)}`)

        throw createError({
            statusCode: 400,
            message: `Error Update file:  ${error.message}`
        })
    }

})