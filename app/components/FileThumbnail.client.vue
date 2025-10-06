<script lang="ts" setup>
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

const props = defineProps({
    document: {
        type: Object,
        required: true
    }
})

let canvas = useTemplateRef('canvas')
let pdfPath = ''

async function renderThumbnails(file: string, uid: string) {
    const worker = new pdfjsLib.PDFWorker()

    const regex = /^.*(documents\/.*)\.md$/;
    const replacement = '/$1.pdf';
    pdfPath = file.replace(regex, replacement);

    console.log(pdfPath)

    let pdf = await pdfjsLib
        .getDocument({ url: pdfPath, worker: worker })
        .promise.then((pdf: any) => pdf)

    console.log(pdf)

    const page = await pdf.getPage(1)

    let viewport = page.getViewport({ scale: 1.0 })

    viewport = page.getViewport({ scale: 200 / viewport.width })

    // const canvas = document.createElement('canvas');
    const context = canvas.value.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;


    await page.render({ canvasContext: context, viewport: viewport })

    console.log(canvas.value)

    canvas.value = page
}

onMounted(() => {
    //pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs`

    renderThumbnails(props.document.metadata.filePath, props.document.metadata.fileId)
})

</script>

<template>
    <UCard :id="document.metadata.fileId" @click='$router.replace(pdfPath)'>
        <canvas ref="canvas"></canvas>
        <template #footer>
            <ul>
                <li class="text-primary text-sm font-bold"> {{ document.title }} </li>
                <li class="text-gray text-xs"> {{ document.filename }} </li>
            </ul>
        </template>
    </UCard>
</template>
