import { useStorage } from '#imports';
import { spawn } from 'child_process';
import { Buffer } from 'buffer';

const PYTHON_SCRIPT = 'convert_pdf_pipe.py';
const STORAGE_KEY = 'blobs'; // Matches nuxt.config.ts

// Helper function to run the Python script and return the output
function runPythonConversion(pdfBase64: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Find the python executable path
        const pythonExecutable = process.platform === 'win32' ? 'python.exe' : 'python3';

        // Spawn the Python process
        const pythonProcess = spawn(pythonExecutable, [PYTHON_SCRIPT], {
            // Pass the API key to the Python environment
            env: { ...process.env },
            // Set cwd to the server directory so python can find the script
            cwd: 'server'
        });

        let markdownOutput = '';
        let errorOutput = '';

        // Pipe the base64 PDF data into Python's stdin
        pythonProcess.stdin.write(pdfBase64);
        pythonProcess.stdin.end(); // Important: signal end of input

        // Capture output
        pythonProcess.stdout.on('data', (data) => {
            markdownOutput += data.toString();
        });

        // Capture errors
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        // Handle process exit
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python script exited with code ${code}.\nError: ${errorOutput.trim()}`));
            } else {
                resolve(markdownOutput.trim());
            }
        });

        // Handle spawn errors (e.g., python not found)
        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}. Check if 'python3' is in PATH.`));
        });
    });
}

export default defineEventHandler(async (event) => {
    // 1. Authentication/Setup
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
        throw createError({ statusCode: 500, statusMessage: 'OPENAI_API_KEY is not configured on the server.' });
    }

    // 2. Read the request body to get the file information (Assuming a simple JSON body)
    // NOTE: For real-world file uploads, you should use `readMultipartFormData(event)`
    const { pdfFilePath, outputFileName } = await readBody(event);

    if (!pdfFilePath || !outputFileName) {
        throw createError({ statusCode: 400, statusMessage: 'Missing pdfFilePath or outputFileName in request body.' });
    }

    const storage = useStorage(STORAGE_KEY);
    const outputKey = outputFileName.endsWith('.md') ? outputFileName : `${outputFileName}.md`;

    try {
        // 3. Read the PDF file content using useStorage
        // Assuming pdfFilePath is a key in your configured storage (e.g., 'my-uploaded-file.pdf')
        // We read it as a raw buffer (binary data)
        const pdfBuffer = await storage.getItemRaw(pdfFilePath);

        if (!pdfBuffer || !(pdfBuffer instanceof Buffer)) {
            throw new Error(`Could not find PDF file at key: ${pdfFilePath} or data is invalid.`);
        }

        // 4. Encode the Buffer to Base64 (string) for safe piping to Python's stdin
        const pdfBase64 = pdfBuffer.toString('base64');

        // 5. Run the Python script and get the Markdown output
        const markdownContent = await runPythonConversion(pdfBase64);

        // 6. Write the resulting Markdown back to storage
        await storage.setItem(outputKey, markdownContent);

        return {
            message: `PDF successfully converted and saved to storage at key: ${outputKey}`,
            key: outputKey,
        };

    } catch (error: any) {
        console.error('Conversion error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'PDF conversion failed.',
            data: error.message,
        });
    }
});