import supabase from '~/utils/supabase'

export default eventHandler(async (event) => {
  const { data, error } = await supabase
    .from('divisions')
    .select()

  if (error) {
    console.error('Error fetching division:', error)

    throw createError({
      statusCode: 400,
      statusMessage: `Error fetching division:  ${error.message}`
    })
  }
  return data
})
