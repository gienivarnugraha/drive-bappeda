import { useUser } from '~/composables/useUser'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    return
  }

  const { isAuthenticated } = await useUser()

  console.log('isAuthenticated', isAuthenticated.value)

  if (isAuthenticated.value) {
    if (to.path === '/login' || to.path === '/') {
      return navigateTo('/home')
    } else {
      return
    }
  } else {
    return navigateTo('/login')
  }
})
