import supabase from '~/utils/supabase'

export default eventHandler(async (event) => {
  const { email, password, logout } = await readBody(event)

  if (logout) {
    const response = await supabase.auth.signOut()

    console.log('success logout', response)

    return response
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('auth error: ', error)

      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    return data
  }
})
