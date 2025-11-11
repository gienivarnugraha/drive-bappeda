import { useUser } from '~/composables/useUser'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.browser) {
    const { isAuthenticated } = await useUser()

    console.log('isAuthenticated', isAuthenticated.value)

    if (!isAuthenticated.value) {
      // If NOT authenticated
      if (to.path !== '/login' && to.path !== '/') {
        // If trying to access a protected route (not '/', not '/login'), redirect to login
        return navigateTo('/login');
      }
    } else {
      // If IS authenticated
      if (to.path === '/login') {
        // If trying to access /login while already authenticated, redirect to home page
        return navigateTo('/');
      }
    }

  } else {
    return
  }

})
