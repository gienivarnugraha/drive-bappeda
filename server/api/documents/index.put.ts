import type { Document, Category, Division } from '#shared/types'
import { inspect } from 'node:util'
import { modifyRelation } from '~~/server/utils/db'
import { getClampedFileNameWithExtension } from '#shared/utils'
import { serverSupabaseClient } from '#supabase/server'

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

    const supabase = await serverSupabaseClient(event)

    let request = supabase
        .from('documents')
        .update(rest)
        .eq('id', documentId)

    const { data: result, error } = await request

    if (error) {
        console.error(`error Update file: ${inspect(error, true, null, true)}`)

        throw createError({
            statusCode: 400,
            statusMessage: `Error Update file:  ${error}`
        })
    } else {
        return { message: `Success Update file: ${getClampedFileNameWithExtension(rest.title || '')}` }
    }
})