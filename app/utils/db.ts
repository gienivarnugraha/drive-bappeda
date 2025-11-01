import type { Category, Division, Document } from "~/types"
import { inspect } from 'node:util'

export const modifyRelation = async (data: { document: Document, categories: number[], divisions: number[] }, action: 'edit' | 'delete') => {
    const { document, categories, divisions } = data

    let request

    if (action === 'edit') {

        let relationData = []

        for (const categoryId of categories) {
            for (const divisionId of divisions) {
                relationData.push({
                    document_id: document.id,
                    category_id: categoryId,
                    division_id: divisionId
                })
            }
        }

        console.log(relationData)

        request = supabase.from('categories_documents_divisions').insert(relationData).select()
    } else {
        request = supabase.from('categories_documents_divisions').delete().eq('document_id', document.id).select()
    }

    let { data: result, error } = await request

    if (error) {
        console.error(`error ${action} relation: ${inspect(error, true, null, true)}`)

        throw createError({
            statusCode: 400,
            statusMessage: `Error ${action} relation:  ${error}`,
        });
    }

    return result
}
