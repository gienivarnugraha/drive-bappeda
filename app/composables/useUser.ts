import type { User } from '~/types'

export const useUser = async () => {
  const user = useState<User | undefined>('user', undefined)

  const supabaseUser = useSupabaseUser()

  const isAuthenticated = computed<boolean>(() => !!supabaseUser.value)

  if (user.value === undefined) {
    const supabase = useSupabaseClient()

    const { data, error } = await supabase.from('profiles').select().eq('uuid', supabaseUser.value.sub)

    if (data) {
      user.value = data[0]
    }

    if (error) {
      console.error('error fetching user', error)
    }
  }

  return {
    user,
    isAuthenticated,
  }
}
