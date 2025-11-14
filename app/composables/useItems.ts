import type { Category, Division } from '#shared/types'
import { toTitleCase } from '#shared/utils'

type Items = Category | Division
export const useItems = async () => {

  const divisions = useState<Division[]>('divisions', () => [])

  const categories = useState<Category[]>('categories', () => [])

  const fetchData = async (type: 'divisions' | 'categories'): Promise<Items[]> => {
    try {
      return await $fetch<Items[]>(`/api/${type}`)

    } catch (error: any) {
      throw createError({
        statusCode: 400,
        message: `Error fetching categories:  ${error.message}`
      })
    }
  }

  if (categories.value.length === 0) {
    categories.value = await fetchData('categories')
  }

  if (divisions.value.length === 0) {
    divisions.value = await fetchData('divisions')
  }

  return {
    divisions,
    categories
  }
}
