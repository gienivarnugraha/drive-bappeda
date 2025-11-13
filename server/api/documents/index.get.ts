import { stringToNumberArray } from '#shared/utils'
import { serverSupabaseClient } from '#supabase/server'

type Schema = {
    category: string[]
    division: string[]
    search: string
    perPage: string
    page: string
    orderBy: 'title' | 'id' | 'created_at' | 'filename'
    orderDir: 'asc' | 'desc'

}

export default defineEventHandler(async (event) => {
    const query = getQuery<Schema>(event)

    const { category, division, perPage, page, orderBy, orderDir } = query

    console.log('documents query:', query)

    const supabase = await serverSupabaseClient(event)

    const request = supabase.rpc('get_documents', {
        filter_category_ids: stringToNumberArray(category),
        filter_division_ids: stringToNumberArray(division),
        page_size: parseInt(perPage),
        page_number: parseInt(page),
        order_by_column: orderBy,
        order_direction: orderDir,
    })

    const { data: response, error } = await request

    if (error) {
        console.error('Error fetching documents:', error.message)

        throw createError({
            statusCode: 400,
            statusMessage: `Error getting documents: ${error}`
        })
    } else {
        return response
    }
})
