import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuid } from 'uuid'


type Schema = {
    filenames: string[],
    category_id: number[],
    division_id: number[],
}

export default eventHandler(async (event) => {
    const data = await readBody<Schema>(event);

    console.log(data)

    const storage = useStorage('documents');

    data.filenames.forEach(async (filename) => {
        console.log('hasItem:', filename, await storage.hasItem(filename))

        // 1. get summary
        // create thumbnail 

        // 2. get metadata

        // 3. add to database

    })

    return { message: 'File added successfully' };
})