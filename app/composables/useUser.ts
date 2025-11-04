import type { User } from '~/types'

export const useUser = async () => {
  const user = useState<User>('user', () => ({} as User))
  const isAuthenticated = useState<boolean>('is-authenticated', () => false)

  try {
    const userStore = localStorage.getItem('user-store')

    if (userStore) {
      user.value = JSON.parse(userStore) as User

    } else {
      const userData = await $fetch<User>('/api/user')
      user.value = userData
    }

  } catch (error) {
    console.log('fetch user error: ', error)
  }

  if (user.value) {
    isAuthenticated.value = true
  }

  return {
    user,
    isAuthenticated
  }
}
