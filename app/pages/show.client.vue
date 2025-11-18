<script setup lang="ts">
import { sanitizeFileName } from '#shared/utils';

const route = useRoute()

const filename = route.query.filename

const page = route.query.page ? Number(route.query.page) : 1

const encoded = encodeURIComponent(filename as string)

let pdf: Ref<string> = ref(`/file?filename=documents/${sanitizeFileName(encoded, true)}/${encoded}`)

console.log(pdf.value)

// either URL, Base64, binary, or document proxy
</script>

<template>
    <ClientOnly>
        <div class="h-[calc(100%-20px)]">
            <PdfViewer :pdf-url="pdf" :page="page" />
        </div>

        <template #fallback>
            <USkeleton class="w-full h-[700px]" />
        </template>
    </ClientOnly>
</template>
