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

    sseSend("push:notif", { message: "File upload started", status: 'info' })

    let filenames: string[] = []

    let filenamesExists: string[] = []

    const storage = useStorage('documents'); // 'uploads' is a bucket defined in nuxt.config.ts

    formData.forEach(async (file) => {
        if (!file.type || !allowedTypes.includes(file.type)) {
            throw createError({
                statusCode: 400,
                statusMessage:
                    `File type ${file.type || "unknown"} not allowed. 
              Allowed types: ${allowedTypes.join(", ")}`,
            });
        }

        if (await storage.hasItem(file.filename!)) {
            filenamesExists.push(file.filename!)

            sseSend("push:notif", { message: `file exists in storage... ${file.filename}`, status: 'info' })

        } else {

            if (file.name === 'file') {
                filenames.push(file.filename!)
            }

            await storage.setItemRaw(file.filename!, file.data)

            sseSend("push:notif", { message: `File ${file.filename} uploaded `, status: 'info' })

        }
    });

    console.log(filenames, filenamesExists)

    if (filenames.length > 0) {
        sseSend("push:notif", { message: `${filenames.join(', ')} sucessfully uploaded...`, status: 'info' })

        return { message: `${filenames.length} files uploaded successfully`, filenames };
    } else {
        sseSend("push:notif", { message: `${filenamesExists.join(', ')} exists in storage...`, status: 'success' })

        throw createError({
            statusCode: 400,
            statusMessage: `${filenamesExists.join(', ')} exists in storage...`,
        });
    }

})