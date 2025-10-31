import { sseSend } from '../utils/sse';
import { setVectorStore } from '~/utils/scripts/init';
import { Document } from '~/types';

type BaseSchema = {
    category_id: number[],
    division_id: number[],
}

type EditSchema = {
    document: Document,
    shouldDelete: boolean,
} & BaseSchema

type PostSchema = {
    filenames: string[],
} & BaseSchema

const documentPath = process.env.DOCUMENT_PATH ?? '';

if (!documentPath) {
    throw new Error('DOCUMENT_PATH environment variable is not set.');
}

export default eventHandler(async (event) => {
    const data = await readBody<EditSchema | PostSchema>(event);

    console.log('document data', data)

    if ('shouldEdit' in data || 'shouldDelete' in data) {
        const { document, shouldDelete, category_id, division_id } = data as EditSchema;

        let request;

        if (shouldDelete === true) {
            // Logic for Deletion
            request = supabase
                .from('documents')
                .delete()
                .eq('document_id', document.id) // Assuming document.id is the key

        } else {
            // Logic for Update (Edit)
            // Need to merge document with updated IDs for category/division
            const updatePayload = {
                ...document,
                category_id, // Assuming document table has category_id and division_id columns
                division_id
            }

            request = supabase
                .from('documents')
                .update(updatePayload) // Use the merged payload
                .eq('id', document.id)
        }

        const { data: result, error } = await request


        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Error ${shouldDelete ? 'Delete' : 'Update'} file:  ${error}`,
            });

        } else {
            return { message: `Success ${shouldDelete ? 'Delete' : 'Update'} file: ${document.filename}` }
        }

    } else {
        const { filenames, ...rest } = data as PostSchema


        for (const filename of filenames) {
            await setVectorStore(`${documentPath}/${filename}`, rest)
        }

        sseSend("close")
    }

})