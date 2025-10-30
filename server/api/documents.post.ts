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

    console.log(data)

    const storage = useStorage('documents');

    const { filenames, ...rest } = data

    for (const filename of filenames) {
        console.log('hasItem:', filename, await storage.hasItem(filename))

        sseSend("push:notif", { message: `processing file... ${filename}`, status: 'info' })
        // The following line calls setVectorStore to store vectors for each document.
        // If you need to disable this for testing or performance reasons, comment it out.
        await setVectorStore(`${documentPath}/${filename}`, rest)
    }

    sseSend("close")
})