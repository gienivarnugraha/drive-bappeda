<script setup lang="ts">
import { getPdfData } from '#imports'

const route = useRoute()

const filename = route.query.filename

const page = route.query.page ? Number(route.query.page) : 1

const config = useRuntimeConfig()

const documentPath = config.public.documentPath

// https://hwhq1hnvu4gvftjq.public.blob.vercel-storage.com/1685513328242-laporan-akhir---kajian-kebijakan-pemerintah-kota-semarang-dalam-pengembangan-ekonomi-kreatif.jpg
const pdfUrl = `${documentPath}/${filename}`

console.log(filename, pdfUrl, page)

let pdf: Ref<string> = ref('')

const isFetching = ref(true)

onMounted(async () => {
    isFetching.value = true
    try {
        pdf.value = await getPdfData(pdfUrl) as string
    } catch (error) {
        console.log(error)
    } finally {
        isFetching.value = false
    }
})

// either URL, Base64, binary, or document proxy
</script>

<template>
    <ClientOnly>
        <div class="h-[calc(100%-20px)]">
            <USkeleton v-if="isFetching" class="w-full h-[700px]" />

            <PdfViewer v-else :pdf-url="pdfUrl" :page="page" />
        </div>
    </ClientOnly>
</template>
