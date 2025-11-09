import type { User } from '~/types'

export const useUser = async () => {
  const user = useState<User>('user', () => ({ display_name: '', avatar: '' }))

  const supabaseUser = useSupabaseUser()

  const config = useRuntimeConfig()

  const isAuthenticated = computed<boolean>(() => !!supabaseUser.value)

  if (supabaseUser.value) {
    const uuid = supabaseUser.value.sub

    const supabase = useSupabaseClient()

    const { data, error } = await supabase.from('profiles').select('display_name, avatar').eq('uuid', uuid).limit(1).single()

    if (data) {
      user.value.display_name = data.display_name as string
      user.value.avatar = sanitizeUrl(config.public.avatarUrl) + '/' + data.avatar as string
    }

    if (error) {
      console.error('error fetching user', error)
    }
  }

  return {
    user: user.value,
    isAuthenticated,
  }
}
