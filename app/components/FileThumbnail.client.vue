<script lang="ts" setup>
import * as pdfjsLib from 'pdfjs-dist';
import { formatBytes } from '#imports';

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

            <canvas ref="canvas"></canvas>

            <template #footer>
                <ul>
                    <li class="text-primary text-xs font-bold"> {{ document.title }} </li>
                    <li class="text-gray text-xs"> {{ formatBytes(document.metadata.filesize) }} </li>
                </ul>
            </template>
        </UCard>
    </ClientOnly>
</template>
