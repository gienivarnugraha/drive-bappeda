// import supabase from '~/utils/supabase'
import { useStorage } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('middleware called')

  //  const user = useSupabaseUser()

  // if (!user.value) {
  //   return navigateTo('/login')
  // }
  return
})
