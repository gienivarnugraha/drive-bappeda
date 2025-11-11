import type { User } from '~/types'

export const _useUser = async () => {
  const user: Ref<User> = ref({ display_name: '', email: '', avatar: '', id: '' })

  const isAuthenticated = computed<boolean>(() => !!user.value.id)

  if (user.value.id === '') {
    try {
      const session = await $fetch('/api/auth', {
        headers: useRequestHeaders(['cookie'])
      })

      console.log('supabase session: ', session)

      user.value.display_name = session?.user_metadata.display_name as string
      user.value.avatar = session?.user_metadata.avatar as string
      user.value.id = session?.sub as string
      user.value.email = session?.email as string

    } catch (error) {
      console.error('auth error: ', error)
    }
  }

  return {
    user,
    isAuthenticated,
  }
}

export const useUser = createSharedComposable(_useUser)