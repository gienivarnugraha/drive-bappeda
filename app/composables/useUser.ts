import type { User } from '~/types'

export const useUser = async () => {
  const user = useState<User>('user', () => ({ display_name: '', avatar: '', id: '' }))

  const supabaseUser = useSupabaseUser()

  const isAuthenticated = computed<boolean>(() => !!supabaseUser.value)

  if (!!supabaseUser.value) {
    const supabase = useSupabaseClient()

    const { data, error } = await supabase.auth.getUser()

    if (data) {
      user.value.display_name = data.user?.user_metadata.display_name as string
      user.value.avatar = data.user?.user_metadata.avatar as string
      user.value.id = data.user?.id as string
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
