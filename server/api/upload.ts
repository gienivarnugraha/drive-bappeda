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

    for (const file of formData) {

        if (!file.type || !allowedTypes.includes(file.type)) {
            throw createError({
                statusCode: 400,
                statusMessage:
                    `File type ${file.type || "unknown"} not allowed. 
              Allowed types: ${allowedTypes.join(", ")}`,
            });
        }

        const filename = file.filename as string

        if (await storage.hasItem(filename)) {
            if (file.name === 'file') {
                filenamesExists.push(filename)
            }

            sseSend("push:notif", { message: `file exists in storage... ${filename}`, status: 'info' })

        } else {
            if (file.name === 'file') {
                filenames.push(filename)
            }

            await storage.setItemRaw(filename, file.data)

            sseSend("push:notif", { message: `File ${filename} uploaded `, status: 'info' })

        }
    }

    if (filenames.length > 0) {
        sseSend("push:notif", { message: `${filenames.join(', ')} sucessfully uploaded...`, status: 'info' })

        return { message: `${filenames.length} files uploaded successfully`, filenames };
    } else {
        sseSend("push:notif", { message: `${filenamesExists.join(', ')} exists in storage...`, status: 'error' })

        throw createError({
            statusCode: 400,
            statusMessage: `${filenamesExists.join(', ')} exists in storage...`,
        });
    }
})