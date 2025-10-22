import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuid } from 'uuid'

export default eventHandler(async (event) => {
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
        throw new Error('No files uploaded.');
    }

    const file = formData.forEach(async (file) => {
        if (file.name === 'file') {
            // const storage = useStorage('documents'); // 'uploads' is a bucket defined in nuxt.config.ts

            //   const filePath = `fs:${uploadedFile.filename}`;

            //   await storage.setItemRaw(filePath, uploadedFile.data);

            const uploadDir = join(process.cwd(), 'public', 'documents'); // Store in public/uploads
            await mkdir(uploadDir, { recursive: true });

            const filePath = join(uploadDir, uuid());
            await writeFile(filePath, file.data);

        }
    });


    return { message: 'File uploaded successfully', path: `/uploads` };
})