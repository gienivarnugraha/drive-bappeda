<script lang="ts" setup>
import * as pdfjsLib from 'pdfjs-dist';
import { formatBytes } from '#imports';
import type { FilteredData } from '~/types'

const props = defineProps({
    data: {
        type: Object as PropType<FilteredData>,
        required: true
    },
    isSelected: {
        type: Boolean,
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
        await renderThumbnails(props.data.documents.metadata.filePath)
    } catch (error) {
        console.error('ERROR LOADING DOCUMENT', error)
    }
})

</script>

<template>
    <ClientOnly>
        <UCard :id="data.documents.metadata.fileId" :class="[isSelected ? 'ring-2 ring-primary' : '']"
            class="cursor-pointer">
            <template #header>
                <div class="flex justify-between align-center">
                    <p class="text-gray text-xs"> {{ data.documents.filename }} </p>
                    <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" />
                </div>
            </template>

            <canvas ref="canvas"></canvas>

            <template #footer>
                <ul>
                    <li class="text-primary text-xs font-bold"> {{ data.documents.title }} </li>
                    <li class="text-gray text-xs"> {{ formatBytes(data.documents.metadata.filesize) }} </li>
                </ul>
            </template>
        </UCard>
    </ClientOnly>
</template>
