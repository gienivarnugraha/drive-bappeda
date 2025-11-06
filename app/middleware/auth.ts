// import supabase from '~/utils/supabase'
import { useUser } from '#imports'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    return
  }

  const { isAuthenticated } = await useUser()

  console.log('user in middleware: ', isAuthenticated.value)

  if (isAuthenticated.value) {
    if (to.path === '/login' || to.path === '/') {
      // return navigateTo('/home')
      return navigateTo('/home')
    } else {
      return
    }
  } else {
    // return navigateTo('/login')
    return
  }
})
