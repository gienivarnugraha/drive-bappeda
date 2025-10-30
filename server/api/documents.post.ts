import { sseSend } from '../utils/sse';
import { setVectorStore } from '~/utils/scripts/init';

type Schema = {
    filenames: string[],
    category_id: number[],
    division_id: number[],
}

const documentPath = process.env.DOCUMENT_PATH ?? '';

if (!documentPath) {
    throw new Error('DOCUMENT_PATH environment variable is not set.');
}

export default eventHandler(async (event) => {
    const data = await readBody<Schema>(event);

    console.log('document data', data)

    const { filenames, ...rest } = data

    for (const filename of filenames) {
        await setVectorStore(`${documentPath}/${filename}`, rest)
    }

    sseSend("close")
})