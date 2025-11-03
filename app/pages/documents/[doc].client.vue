<script setup lang="ts">
const route = useRoute()

const filename = route.params.doc

const page = route.query.page ? Number(route.query.page) : 1

const config = useRuntimeConfig()

const documentPath = config.public.documentPath

const pdfSource = `${documentPath}/${filename}`

console.log(route, pdfSource, page)

let pdf: Ref<string> = ref('')

const isFetching = ref(true)

async function getPdfData(url: string) {
  isFetching.value = true
  try {
    const response = await fetch(url);

    // 1. Check for success status
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 2. Get the response body as a Blob (binary data)
    const pdfBlob = await response.blob();

    // 3. Create a local URL for the Blob object
    const blobUrl = URL.createObjectURL(pdfBlob);

    pdf.value = blobUrl as string

    console.log('PDF data successfully fetched and stored in a Blob URL:', blobUrl);

    // You can now use the blobUrl to set the src of an <iframe> or a <embed> tag:
    // document.getElementById('pdf-viewer').src = blobUrl;

    return blobUrl;

  } catch (error) {
    console.error('Failed to fetch PDF due to CORS or network error:', error);
    // You might want to fall back to opening the link directly here
    return null;
  } finally {
    isFetching.value = false
  }
}

onMounted(async () => {
  await getPdfData(pdfSource)
})

// either URL, Base64, binary, or document proxy
</script>

<template>
  <ClientOnly>
    <div class="p-4 h-screen">
      <!-- <h1 class="text-3xl font-bold mb-6">{{ filename }} 📄</h1> -->

      <div class="h-[calc(100%-20px)]">
        <USkeleton v-if="isFetching" class="w-full h-[700px]" />

        <PdfViewer v-else :pdf-url="pdfSource" :page="page" />
      </div>

    </div>
  </ClientOnly>
</template>
