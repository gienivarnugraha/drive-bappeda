<script setup lang="ts">
import { sanitizeFileName } from '#shared/utils';

const route = useRoute()

const filename = route.query.filename

const page = route.query.page ? Number(route.query.page) : 1

const url = `/file?filename=documents:${sanitizeFileName(filename as string, true)}:${filename}`

let pdf: Ref<ArrayBuffer | undefined> = ref(undefined)

onMounted(async () => {
    let blob = await $fetch<Blob>(url)

    pdf.value = await blob.arrayBuffer()

    console.log(pdf.value)
})


// either URL, Base64, binary, or document proxy
</script>

<template>
    <ClientOnly>
        <div class="h-[calc(100%-20px)]">
            <LazyPdfViewer v-if="pdf" :pdf-url="pdf" :page="page" />
        </div>

        <template #fallback>
            <USkeleton class="w-full h-[700px]" />
        </template>
    </ClientOnly>
</template>
