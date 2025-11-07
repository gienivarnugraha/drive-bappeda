import type { Document, Category, Division } from '~/types'
import { inspect } from 'node:util'
import { modifyRelation } from '~/utils/db'
import { getClampedFileNameWithExtension } from '~/utils'
import supabase from '~/utils/supabase'

type Schema = {
    document: Document
    categories: Category[]
    divisions: Division[]
}

export default defineEventHandler(async (event) => {
    const data = await readBody<Schema>(event)

    const { document, categories, divisions } = data

    const categoryIds = categories.length ? categories.map(category => category.id) : []
    const divisionIds = divisions.length ? divisions.map(division => division.id) : []

    await modifyRelation({ document }, 'delete')

    // add the relation again after deleting
    await modifyRelation({ document, categoryIds, divisionIds }, 'edit')

    // throw categories and division
    const { categories: cat, divisions: div, ...payload } = document

    let request = supabase
        .from('documents')
        .upsert(payload, { onConflict: 'id' })
        .eq('id', document.id)


    const { data: result, error } = await request

    if (error) {
        console.error(`error Update file: ${inspect(error, true, null, true)}`)

        throw createError({
            statusCode: 400,
            statusMessage: `Error Update file:  ${error}`
        })
    } else {
        return { message: `Success Update file: ${getClampedFileNameWithExtension(document.filename)}` }
    }
})