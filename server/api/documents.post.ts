import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuid } from 'uuid'
import { setVectorStore } from '~/utils/scripts/init';


type Schema = {
    filenames: string[],
    category_id: number[],
    division_id: number[],
}
const documentPath = process.env.DOCUMENT_PATH
export default eventHandler(async (event) => {
    const data = await readBody<Schema>(event);

    console.log(data)

    const storage = useStorage('documents');

    const { filenames, ...rest } = data

    filenames.forEach(async (filename) => {
        console.log('hasItem:', filename, await storage.hasItem(filename))

        await setVectorStore(`${documentPath}/${filename}`, rest)
    })

    return { message: 'File added successfully' };
})