import type { Category, Division } from '~/types'

export const useItems = async () => {
    const divisions = useState<Division[]>('divisions', () => [])
    const categories = useState<Category[]>('categories', () => [])


    if (categories.value.length === 0) {
        const categoriesData = await $fetch<Category[]>('/api/categories')
        let cat = categoriesData.map((category: Category) => ({ ...category, name: toTitleCase(category.name) }))
        categories.value = cat
    }

    if (divisions.value.length === 0) {
        const divisionsData = await $fetch<Division[]>('/api/divisions')
        let div = divisionsData.map((division: Division) => ({ ...division, name: toTitleCase(division.name) }))
        divisions.value = div
    }

    return {
        divisions,
        categories
    }
}