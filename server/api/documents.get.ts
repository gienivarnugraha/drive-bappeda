import { Document, FilteredData, Results } from '../../app/types/index';
import { stringToNumberArray } from '~/utils';
import { inspect } from 'node:util'
import supabase from '~/utils/supabase'

const getPagination = (page: number, size: number) => {
    const limit = size ? +size : 3;
    const from = page ? page * limit : 0;
    const to = page ? from + size : size;

    console.log(limit, from, to)

    return { from, to };
};

const countDocument = async () => {
    let { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: `Error counting documents:  ${error}`,
        });
    }

    return count
}

export default eventHandler(async (event) => {
    const query = getQuery<{ category: string[]; division: string[]; search: string, perPage: string, page: string }>(event)

    let { category, division, search, } = query


    let perPage = parseInt(query.perPage)
    let page = parseInt(query.page)

    const { from, to } = getPagination(page - 1, perPage)

    console.log('documents query:', query)

    let request = supabase
        .from('categories_documents_divisions')
        .select(`
                documents(*),
                categories(id, name), 
                divisions(id, name)
            `
        )
    // .range(from, to)

    if (category) {
        request = request.in('category_id', stringToNumberArray(category))
    }

    if (division) {
        request = request.in('division_id', stringToNumberArray(division))
    }

    if (category && division) {
        request = request.or(`category_id.in.(${stringToNumberArray(category)}) , division_id.in.(${stringToNumberArray(division)})`)
    }

    const { data: response, error } = await request

    if (error) {
        console.error('Error fetching documents:', error.message);

        throw createError({
            statusCode: 400,
            statusMessage: `Error getting documents: ${error}`,
        });
    } else {
        const count = await countDocument()

        return {
            count,
            data: groupBy(response),
            page: page,
        }
    }

})

const groupBy = (array: any[]): Results[] => {

    let data: Document[] = []

    array.forEach((item: FilteredData) => {
        let index = data.findIndex((it) => it.id === item.documents.id)

        let categories = item.categories ?? { id: 0, name: 'Tidak ada Kategori' }

        let divisions = item.divisions ?? { id: 0, name: 'Tidak ada Bidang' }

        if (index > 0) {
            data[index].categories = removeDuplicates(data[index].categories, categories)

            data[index].divisions = removeDuplicates(data[index].divisions, divisions)
        } else {
            data.push({
                ...item.documents,
                categories: [categories],
                divisions: [divisions],
            })
        }
    });

    return data
};

interface Identifiable {
    id: any; // Use 'any' or a specific type like 'number' or 'string' for the ID
    // You can add other properties here if known
    [key: string]: any;
}

const removeDuplicates = <T extends Identifiable>(array: T[], newData: T): T[] => {
    // 1. Merge the two arrays
    let data = [...array, newData];

    // 2. Filter the merged array for unique items
    return data.filter((item, index, self) => {
        // self.findIndex finds the *first* index where the condition is true.
        // If the current item's index matches that first index, it is a unique item
        // in the merged array (first one encountered wins).
        return index === self.findIndex((t) => t.id === item.id);
    });
}