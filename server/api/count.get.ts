import supabase from '~/utils/supabase'

export default defineEventHandler(async (event) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })

  console.log('count:', data)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Error counting documents:  ${error}`
    })
  }

  return data
})
