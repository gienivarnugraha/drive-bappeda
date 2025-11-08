import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('categories')
    .select()

  if (error) {
    console.error('error fetching categories', error)

    throw createError({
      statusCode: 400,
      statusMessage: `Error fetching categories:  ${error.message}`
    })
  }

  return data
})
