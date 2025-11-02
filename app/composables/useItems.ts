import type { Category, Division } from '~/types'

export const useItems = async () => {
  const divisions = useState<Division[]>('divisions', () => [])
  const categories = useState<Category[]>('categories', () => [])

  if (categories.value.length === 0) {
    const categoriesData = await $fetch<Category[]>('/api/categories')
    if (categoriesData) {
      categories.value = categoriesData.map((category: Category) => ({ ...category, name: toTitleCase(category.name) }))
    }
  }

  if (divisions.value.length === 0) {
    const divisionsData = await $fetch<Division[]>('/api/divisions')
    if (divisionsData) {
      divisions.value = divisionsData.map((division: Division) => ({ ...division, name: toTitleCase(division.name) }))
    }
  }

  return {
    divisions,
    categories
  }
}
