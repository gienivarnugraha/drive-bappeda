<script lang="ts" setup>
import * as pdfjsLib from 'pdfjs-dist';

export interface Document {
    id: number;
    filename: string;
    title: string;
    metadata: Metadata;
    created_at: string;
    uuid: string;
}

export interface Metadata {
    docIds: string[];
    fileId: string;
    summary: string;
    filePath: string;
    filename: string;
    filesize: number;
    createdAt: string;
    extension: string;
    modifiedAt: string;
}


const props = defineProps({
    document: {
        type: Object as PropType<Document>,
        required: true
    }
})

let canvas = useTemplateRef('canvas') as Ref<HTMLCanvasElement>
let pdfPath = ''

/**
 * Converts a number of bytes into a human-readable file size string.
 * @param {number} bytes The file size in bytes.
 * @param {number} decimals The number of decimal places to include (default is 2).
 * @returns {string} The formatted file size string (e.g., "1.21 KB").
 */
function formatBytes(bytes: number, decimals = 2) {
    // 1. Handle edge case of 0 bytes
    if (bytes === 0) return '0 Bytes';

    // 2. Define constants for calculation
    const k = 1024; // Base unit for binary prefixes (KiB, MiB, etc. or KB, MB, etc. based on convention)
    const dm = decimals < 0 ? 0 : decimals; // Ensure decimals is not negative
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    // 3. Calculate the index for the appropriate unit (logarithm base 1024)
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // 4. Calculate the formatted value and append the unit
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function renderThumbnails(file: string) {
    const worker = new pdfjsLib.PDFWorker()

    const regex = /^.*(documents\/.*)\.md$/;
    const replacement = '/$1.pdf';
    pdfPath = file.replace(regex, replacement);

    let load = pdfjsLib.getDocument({ url: pdfPath, worker })

    let pdf = await load.promise

    const page = await pdf.getPage(1)

    let viewport = page.getViewport({ scale: 0.25 })

    const context = canvas.value.getContext('2d');
    canvas.value.height = viewport.height;
    canvas.value.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise

    // return canvas.toDataURL('image/png')
}

onMounted(async () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

    try {
        await renderThumbnails(props.document.metadata.filePath)
    } catch (error) {
        console.error('ERROR LOADING DOCUMENT', error)
    }
})

</script>

<template>
    <ClientOnly>
        <UCard :id="document.metadata.fileId">
            <template #header>
                <div class="flex justify-between align-center">
                    <p class="text-gray text-xs"> {{ document.filename }} </p>
                    <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" />
                </div>
            </template>
            <canvas ref="canvas" @click='$router.push(pdfPath)'></canvas>
            <template #footer>
                <ul>
                    <li class="text-primary text-xs font-bold"> {{ document.title }} </li>
                    <li class="text-gray text-xs"> {{ formatBytes(document.metadata.filesize) }} </li>
                </ul>
            </template>
        </UCard>
    </ClientOnly>
</template>
