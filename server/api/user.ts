// import { serverSupabaseClient } from '#supabase/server'
import supabase from '~/utils/supabase'

export default eventHandler(async (event) => {
  // const supabase = await serverSupabaseClient(event)
  supabase.auth.onAuthStateChange((event, session) => {
    // user.value = session?.user as any;

    console.log(session)
  });

  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching users', error)

    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return data
})
