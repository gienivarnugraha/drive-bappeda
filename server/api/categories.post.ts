import { Category } from "~/types"

type EditSchema = {
    shouldDelete: boolean
} & Category

export default eventHandler(async (event) => {
    const { shouldDelete, ...payload } = await readBody<EditSchema>(event);

    let request

    if (shouldDelete) {
        request = supabase
            .from('categories')
            .delete()
            .eq('id', payload.id)
    } else {
        request = supabase
            .from('categories')
            .upsert(payload)
    }

    const { data, error } = await request

    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: `Error ${shouldDelete ? 'Delete' : 'Update'} category:  ${error}`,
        });
    }

    if (data) {
        return { message: `Success ${shouldDelete ? 'Delete' : 'Update'} category: ${payload.name}` }
    }
})