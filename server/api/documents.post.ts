import { sseSend } from '../utils/sse';
import { setVectorStore } from '~/utils/scripts/init';
import { Document } from '~/types';
import { inspect } from 'node:util';
import { modifyRelation } from '~/utils/db'

type BaseSchema = {
    categories: number[],
    divisions: number[],
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
        const { document, shouldDelete, categories, divisions } = data as EditSchema;

        let request;

        if (shouldDelete === true) {
            // Logic for Deletion
            request = supabase
                .from('documents')
                .delete()
                .eq('id', document.id) // Assuming document.id is the key

            await modifyRelation({ document, categories, divisions }, 'delete')

        } else {
            request = supabase
                .from('documents')
                .update({
                    title: document.title,
                })
                .eq('id', document.id)

            await modifyRelation({ document, categories, divisions }, 'edit')
        }

        const { data: result, error } = await request


        if (error) {
            console.error(`error ${shouldDelete ? 'Delete' : 'Update'} file: ${inspect(error, true, null, true)}`)

            throw createError({
                statusCode: 400,
                statusMessage: `Error ${shouldDelete ? 'Delete' : 'Update'} file:  ${error}`,
            });

        } else {
            return { message: `Success ${shouldDelete ? 'Delete' : 'Update'} file: ${document.filename}` }
        }

    } else {
        const { filenames, categories, divisions } = data as PostSchema


        for (const filename of filenames) {
            await setVectorStore(`${documentPath}/${filename}`, { category_id: categories, division_id: divisions })
        }

        sseSend("close")
    }

})