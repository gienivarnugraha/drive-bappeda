import { useUser } from '~/composables/useUser'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    return
  }

  const { isAuthenticated } = await useUser()

  console.log('isAuthenticated', isAuthenticated.value)

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
  return
})
