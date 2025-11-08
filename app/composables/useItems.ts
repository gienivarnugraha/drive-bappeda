import type { Category, Division } from '~/types'

export const useItems = async () => {
  const supabase = useSupabaseClient()

  const divisions = useState<Division[]>('divisions', () => [])

  const categories = useState<Category[]>('categories', () => [])

  const fetchData = async (type: 'divisions' | 'categories'): Promise<Category[] | Division[]> => {

    const { data, error } = await supabase
      .from(type)
      .select()

    if (error) {
      console.error('error fetching categories', error)

      throw createError({
        statusCode: 400,
        statusMessage: `Error fetching categories:  ${error.message}`
      })
    }

    return data
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
