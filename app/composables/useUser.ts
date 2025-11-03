import type { User } from '~/types'

export const useUser = async () => {
  const user = useState<User>('user', () => ({} as User))

  try {
    const userData = await $fetch<User>('/api/user')
    console.log('user', userData)

    return userData

  } catch (error) {
    console.log(error)
  }

}
