import type { Category, Division } from '#shared/types'
import { toTitleCase } from '#shared/utils'

export const useItems = async () => {

  const divisions = useState<Division[]>('divisions', () => [])

  const categories = useState<Category[]>('categories', () => [])

  const fetchData = async (type: 'divisions' | 'categories'): Promise<Category[] | Division[]> => {
    try {
      const response = await $fetch<Category[] | Division[]>(`/api/${type}`)

      return response

    } catch (error: any) {
      throw createError({
        statusCode: 400,
        message: `Error fetching categories:  ${error.message}`
      })

    }

  }

  if (categories.value.length === 0) {

    const data = await fetchData('categories')

    if (data) {
      categories.value = data.map((category: Category) => ({ ...category, name: toTitleCase(category.name) }))
    }

  }

  if (divisions.value.length === 0) {

    const data = await fetchData('divisions')

    if (data) {
      divisions.value = data.map((division: Division) => ({ ...division, name: toTitleCase(division.name) }))
    }

  }

  return {
    divisions,
    categories
  }
}
