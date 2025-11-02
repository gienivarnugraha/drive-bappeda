// import supabase from '~/utils/supabase'
import { useStorage } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('middleware called')

  // const user = localStorage.getItem('user-store')

  // console.log('user:', user)
  // const user = await supabase.auth.getUser()
  // console.log('user:', user)
  return
})
