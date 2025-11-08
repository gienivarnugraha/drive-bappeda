import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  const { count, error } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('error fetching categories', error)

    throw createError({
      statusCode: 400,
      statusMessage: `Error fetching categories:  ${error.message}`
    })
  }

  return count
})
