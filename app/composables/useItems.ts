import type { Category, Division } from '~/types'

export const useItems = async () => {
    const divisions = useState<Division[]>('divisions', () => [])
    const categories = useState<Category[]>('categories', () => [])


    if (categories.value.length === 0) {
        const { data: categoriesData } = await useFetch<Category[]>('/api/categories')
        categories.value = categoriesData.value || []
    }

    if (divisions.value.length === 0) {
        const { data: divisionsData } = await useFetch<Division[]>('/api/divisions')
        divisions.value = divisionsData.value || []
    }

    return {
        divisions,
        categories
    }
}