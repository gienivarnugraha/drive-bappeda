import { spawn } from 'child_process';
import { sanitizeFileName, clampFilename } from '../../shared/utils';
import { resolveStoragePath } from './file';
import { createError } from 'h3';
import { sseSend } from './sse';

// Helper function to run the Python script and return the output
function runPythonConversion(input: string, output: string): Promise<string> {

    const PYTHON_SCRIPT = resolveStoragePath('convert.py')

    const config = useRuntimeConfig()

    return new Promise((resolve, reject) => {
        // Find the python executable path
        const pythonExecutable = process.platform === 'win32' ? 'python.exe' : 'python3';

        // Spawn the Python process
        const pythonProcess = spawn(pythonExecutable, [PYTHON_SCRIPT, input, output], {
            // Pass the API key to the Python environment
            env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY, ...process.env },
            // Set cwd to the server directory so python can find the script
            cwd: 'server',
        });


        let dataOutput: string = ''
        let errorOutput: string = '';

        // Capture output
        pythonProcess.stdout.on('data', (data) => {
            console.info('python stdout:', data.toString())
            dataOutput += data.toString();
        });

        // Capture errors
        pythonProcess.stderr.on('data', (data) => {
            console.info('python stderr:', data.toString())
            errorOutput += data.toString();
        });

        // Handle process exit
        pythonProcess.on('close', (data) => {
            console.info('python close:', data)

            if (data !== 0) {
                reject(new Error(`Python script exited with data ${data}.\nError: ${errorOutput}`));
            } else {
                console.log('python on close result: ', dataOutput)
                resolve(dataOutput);
            }
        });

        // Handle spawn errors (e.g., python not found)
        pythonProcess.on('error', (err) => {
            console.error('python script on error', err)
            reject(new Error(`Failed to start Python process: ${err.message}. Check if 'python3' is in PATH.`));
        });
    });
}

export async function convertToMarkdown(filename: string): Promise<string> {
    const config = useRuntimeConfig()

    sseSend('push:notif', { message: `converting ${clampFilename(filename)} to markdown..`, status: 'info' })

    const openAiKey = process.env.OPENAI_API_KEY;

    if (!openAiKey) {
        throw createError({ statusCode: 500, statusMessage: 'OPENAI_API_KEY is not configured on the server.' });
    }

    const storage = useStorage(process.env.STORAGE_KEY)

    const sanitizedName = sanitizeFileName(filename as string, false)
    const dirname = sanitizeFileName(filename as string)
    const documentPath = `documents/${dirname}/${sanitizedName}`

    if (!await storage.has(documentPath)) {
        sseSend('push:notif', { message: `${clampFilename(filename)} doesnt exists..`, status: 'error' })

        throw createError({
            statusCode: 500,
            statusMessage: 'PDF conversion failed.',
            data: `${clampFilename(filename)} doesnt exists..`,
        });
    }

    const input = resolveStoragePath(documentPath);

    const output = resolveStoragePath(`${sanitizeFileName(documentPath, true)}.md`)

    try {
        const data = await runPythonConversion(input, output);

        console.log('result from runPython', data)

        sseSend('push:notif', { message: `success convertin ${clampFilename(filename)} to markdown..`, status: 'info' })

        return output;

    } catch (error: any) {
        console.error('Conversion error:', error);

        sseSend('push:notif', { message: `convert ${clampFilename(filename)} error..`, status: 'error' })

        throw createError({
            statusCode: 500,
            statusMessage: 'PDF conversion failed.',
            data: error.message,
        });
    }
}