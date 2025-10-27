import { mkdir, writeFile, cp } from 'node:fs/promises';
import { join } from 'node:path';

import { sseSend } from '../utils/sse';

const allowedTypes = [
    "image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain",];


export default eventHandler(async (event) => {
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
        throw new Error('No files uploaded.');
    }

    sseSend("push:notif", { message: "File upload started" })

    let filenames: string[] = []

    formData.forEach(async (file) => {
        if (!file.type || !allowedTypes.includes(file.type)) {
            throw createError({
                statusCode: 400,
                statusMessage:
                    `File type ${file.type || "unknown"} not allowed. 
              Allowed types: ${allowedTypes.join(", ")}`,
            });
        }

        const storage = useStorage('documents'); // 'uploads' is a bucket defined in nuxt.config.ts

        if (file.name === 'file') {
            filenames.push(file.filename!)
        }


        await storage.setItemRaw(file.filename!, file.data)

        sseSend("push:notif", { message: `File ${file.filename} uploaded ` })
    });

    return { message: 'File uploaded successfully', filenames };
})