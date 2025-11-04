// import supabase from '~/utils/supabase'
import { useUser } from '#imports'
import { useStorage } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    return
  }

  console.log('middleware called')
  const { isAuthenticated } = await useUser()

  console.log('user in middleware: ', isAuthenticated.value)

  if (isAuthenticated.value) {
    // if (to.path === '/login' || to.path === '/') {
    //   return navigateTo('/home')
    // } else {
    //   return
    // }
    return
  } else {
    return navigateTo('/login')
  }
})
