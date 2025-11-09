import { useUser } from '~/composables/useUser'
// import { serverSupabaseUser } from '#supabase/server'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    // const user = await serverSupabaseUser(event)

    // console.log('serverSupabaseUser', serverSupabaseUser)

    return
  }

  const { isAuthenticated } = await useUser()

  console.log('isAuthenticated', isAuthenticated.value)

  if (isAuthenticated.value) {
    if (to.path === '/login') {
      return navigateTo('/home')
    } else {
      return
    }
  } else {
    return navigateTo('/login')
  }
})
