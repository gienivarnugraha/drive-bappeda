import type { User } from '~/types'

export const useUser = async () => {
  const user = useState<User>('user', () => ({} as User))

  // Simply check if the user object exists (is not null)
  const isAuthenticated = computed<boolean>(() => !!user.value)

  const data = await $fetch<User>('/api/user')

  if (data) {
    user.value = data
  }

  return {
    user,
    isAuthenticated,
  }
}
