import { Document, FilteredData, Results } from '../../app/types/index';

const stringToNumberArray = (input: string[] | string): number[] => {
    if (!Array.isArray(input)) {
        return [parseInt(input)]
    }
    return input.map((item) => parseInt(item))
}



export default eventHandler(async (event) => {
    const query = getQuery<{ category: string[]; division: string[]; search: string }>(event)

    let { category, division, search } = query

    console.log('documents query:', category, division, search)
    /* 
        const options = {
            limit: 10,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        }
    
        if (search) {
            Object.assign(options, { search })
        } */

    let request = supabase
        .from('categories_documents_divisions')
        .select(`
                documents(*),
                categories(id, name), 
                divisions(id, name)
            `
        )

    if (category) {
        request = request.in('category_id', stringToNumberArray(category))
    }

    if (division) {
        request = request.in('division_id', stringToNumberArray(division))
    }

    if (category && division) {
        request = request.or(`category_id.in.(${stringToNumberArray(category)}) , division_id.in.(${stringToNumberArray(division)})`)
    }

    const { data, error } = await request


    if (error) {
        console.error('Error fetching documents:', error.message);
    } else {
        return groupBy(data)
    }

})

const groupBy = (array: FilteredData[]) => {

    let data: Document[] = []

    array.forEach((item) => {
        let index = data.findIndex((it) => it.id === item.documents.id)

        if (index > 0) {
            if (!data[index].categories.includes(item.categories)) {
                data[index].categories.push(item.categories)
            }
            if (!data[index].divisions.includes(item.divisions)) {
                data[index].divisions.push(item.divisions)
            }
        } else {
            data.push({
                ...item.documents,
                categories: [item.categories],
                divisions: [item.divisions],
            })
        }
    });

    return data
};