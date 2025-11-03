// import supabase from '~/utils/supabase'
import { useUser } from '#imports'
import { useStorage } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('middleware called')
  const user = useUser()

  console.log('user in middleware', user)

  // const user = await supabase.auth.getUser()
  // console.log(user)
  //  const user = useSupabaseUser()

  // if (!user.value) {
  //   return navigateTo('/login')
  // }
  return
})
