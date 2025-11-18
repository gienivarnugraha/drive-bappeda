import { spawn } from 'child_process';
import { Buffer } from 'buffer';
import { readFile, writeFile } from 'fs/promises';
import { sanitizeFileName } from '#shared/utils';
import { createError } from 'h3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { type H3Event } from 'h3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const PYTHON_SCRIPT = `${__dirname}/convert_to_md.py`;
const PYTHON_SCRIPT = `./convert_to_md.py`;

// Helper function to run the Python script and return the output
function runPythonConversion(input: string, output: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Find the python executable path
        const pythonExecutable = process.platform === 'win32' ? 'python.exe' : 'python3';

        // Spawn the Python process
        const pythonProcess = spawn(pythonExecutable, [PYTHON_SCRIPT, input, output], {
            // Pass the API key to the Python environment
            env: { ...process.env },
            // Set cwd to the server directory so python can find the script
            cwd: 'server'
        });

        let errorOutput: string[] = [];

        // Capture output
        pythonProcess.stdout.on('data', (data) => {
            console.error('on stdout:', data.toString())
        });

        // Capture errors
        pythonProcess.stderr.on('data', (data) => {
            errorOutput.push(data.toString());
        });

        // Handle process exit
        pythonProcess.on('close', (data) => {
            console.error('on close:', data)
            if (data !== 0) {
                reject(new Error(`Python script exited with data ${data}.\nError: ${errorOutput}`));
            }
        });

        // Handle spawn errors (e.g., python not found)
        pythonProcess.on('error', (err) => {
            console.error('on error', err)
            reject(new Error(`Failed to start Python process: ${err.message}. Check if 'python3' is in PATH.`));
        });
    });
}

export async function convertToMarkdown(event: H3Event, file: string): Promise<{ message: string, data: string }> {
    const config = useRuntimeConfig(event)
    const openAiKey = config.OPENAI_API_KEY;
    if (!openAiKey) {
        throw createError({ statusCode: 500, statusMessage: 'OPENAI_API_KEY is not configured on the server.' });
    }

    if (!file) {
        throw createError({ statusCode: 400, statusMessage: 'Missing pdfFilePath or outputFileName in request body.' });
    }

    // const storage = useStorage('public')
    const filepath = `./public/documents/${sanitizeFileName(file, true)}`
    // const filepath = join(__dirname, '..', 'public', 'documents', sanitizeFileName(file, true))

    // const output = `${filepath}:${sanitizeFileName(file, true)}.md`;
    const output = join(filepath, `${sanitizeFileName(file, true)}.md`)

    const input = join(filepath, file)

    console.error('input: ', input)
    console.error('output: ', output)

    try {
        const markdownContent = await runPythonConversion(input, output);

        console.error(markdownContent)

        return {
            message: `PDF successfully converted and saved to storage at: ${output}`,
            data: output,
        }

    } catch (error: any) {
        console.error('Conversion error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'PDF conversion failed.',
            data: error.message,
        });
    }
}