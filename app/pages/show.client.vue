<script setup lang="ts">
import { sanitizeUrl, getPdfData, sanitizeFileName } from '#shared/utils';

const route = useRoute()

const filename = route.query.filename

const page = route.query.page ? Number(route.query.page) : 1

const pdfUrl = sanitizeUrl(`documents/${sanitizeFileName(filename as string, true)}/${filename}`)

let pdf: Ref<string> = ref('')

const isFetching = ref(true)

onMounted(async () => {
    isFetching.value = true
    try {
        const blob = await getPdfData(pdfUrl)

        if (blob) {
            pdf.value = URL.createObjectURL(blob);
        }

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

        <template #fallback>
            <USkeleton class="w-full h-[700px]" />
        </template>
    </ClientOnly>
</template>
