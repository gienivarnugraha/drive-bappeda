import { stringToNumberArray } from '#shared/utils'
import { useDrizzle, } from '~~/server/utils/drizzle'
import { sql } from 'drizzle-orm'

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

    const db = useDrizzle(event)

    const filter_category_ids = category ? `{${stringToNumberArray(category)}}` : null
    const filter_division_ids = division ? `{${stringToNumberArray(division)}}` : null
    const page_size = parseInt(perPage)
    const page_number = parseInt(page)
    const order_by_column = orderBy
    const order_direction = orderDir

    try {
        const { rows } = await db.execute(
            sql`SELECT * FROM get_documents(${page_size},${page_number},${filter_category_ids},${filter_division_ids},${order_by_column},${order_direction}) as results`
        )

        return rows
    } catch (error: any) {
        console.error('Error fetching documents:'
            , error)

        throw createError({
            statusCode: 400,
            message: `Error getting documents: ${error.message}`
        })
    }
})
