import { Document, FilteredData, Results } from '../../app/types/index'
import { stringToNumberArray } from '~/utils'
import { inspect } from 'node:util'
import supabase from '~/utils/supabase'

export default defineEventHandler(async (event) => {
  const query = getQuery<{ category: string[], division: string[], search: string, perPage: string, page: string }>(event)

  const { category, division, perPage, page } = query

  console.log('documents query:', query)

  const request = supabase.rpc('get_documents', {
    filter_category_ids: stringToNumberArray(category),
    filter_division_ids: stringToNumberArray(division),
    page_size: parseInt(perPage),
    page_number: parseInt(page)
  })

  const { data: response, error } = await request

  if (error) {
    console.error('Error fetching documents:', error.message)

    throw createError({
      statusCode: 400,
      statusMessage: `Error getting documents: ${error}`
    })
  } else {
    return {
      data: response,
      page: query.page
    }
  }
})
