<template>
    <UCard class="w-full h-full flex flex-col p-0">
        <template #header>
            <div class="flex items-center justify-between gap-4 p-2">
                <div class="flex items-center space-x-2">
                    <UButton icon="i-heroicons-arrow-left" :disabled="!pageControl || pageControl.currentPage === 1"
                        color="primary" variant="ghost" @click="previousePage" />
                    <UInput :model-value="pageControl?.currentPage ?? 1" type="number" :min="1"
                        :max="pageControl?.totalPages ?? 1" class="w-16 text-center" @change="goToPage" />
                    <span class="text-gray-500">of {{ pageControl?.totalPages ?? '-' }}</span>
                    <UButton icon="i-heroicons-arrow-right"
                        :disabled="!pageControl || pageControl.currentPage === pageControl.totalPages" color="primary"
                        variant="ghost" @click="nextPage" />
                </div>

                <div class="flex items-center space-x-2">
                    <UButton icon="i-heroicons-magnifying-glass-minus" color="primary" variant="ghost"
                        @click="handleZoom('out')" />
                    <span class="text-sm font-semibold w-12 text-center">{{ currentZoomPercentage }}</span>
                    <UButton icon="i-heroicons-magnifying-glass-plus" color="primary" variant="ghost"
                        @click="handleZoom('in')" />

                    <UButton icon="i-heroicons-arrow-down-tray" color="primary" variant="soft"
                        @click="downloadControl?.download()">
                        Download
                    </UButton>
                </div>
            </div>
        </template>

        <div class="grow overflow-auto min-h-[500px]">
            <VPdfViewer ref="vpvRef" :src="pdfUrl" :toolbar-options="false" class="w-full h-full" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { VPdfViewer } from '@vue-pdf-viewer/viewer';

// Define Props for the PDF URL
const props = defineProps<{
    pdfUrl: string;
    page?: number
}>();

onMounted(() => {
    props.page && pageControl.value?.goToPage(props.page)
    console.log(props.page, pageControl.value)
})
// Refs for the viewer instance
const vpvRef: any = useTemplateRef('vpvRef');

// --- Viewer API Control (Controls are accessed via the ref) ---

// Page Control
const pageControl = computed(() => (vpvRef.value as any)?.pageControl);

const previousePage = () => {
    if (pageControl.value) {
        pageControl.value.goToPage(pageControl.value.currentPage - 1);
    }
};

const nextPage = () => {
    if (pageControl.value) {
        pageControl.value.goToPage(pageControl.value.currentPage + 1);
    }
};

const goToPage = (event: Event) => {
    const pageNumber = parseInt((event.target as HTMLInputElement).value);
    if (pageNumber > 0 && pageControl.value) {
        pageControl.value.goToPage(pageNumber);
    }
};

console.log(vpvRef)

// Zoom Control
const zoomControl = computed(() => (vpvRef.value as any)?.zoomControl);
const currentScale = computed(() => zoomControl.value?.scale || 1);
const currentZoomPercentage = computed(() => `${Math.round(currentScale.value * 100)}%`);

const handleZoom = (type: 'in' | 'out') => {
    if (!zoomControl.value) return;
    const current = currentScale.value;
    let newScale = current;

    if (type === 'in') {
        newScale = current < 3.0 ? current + 0.25 : 3.0; // Max zoom
    } else if (type === 'out') {
        newScale = current > 0.5 ? current - 0.25 : 0.5; // Min zoom
    }

    zoomControl.value.zoom(newScale);
};

// Download Control
const downloadControl = computed(() => (vpvRef.value as any)?.downloadControl);

</script>

<style scoped>
/* Optional: Ensure the card content fills the space correctly */
.u-card {
    --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    box-shadow: var(--tw-shadow);
    border-radius: var(--rounded-lg);
}

.u-card :deep(.p-0) {
    padding: 0 !important;
}

.u-card :deep(.vpv-viewer-main) {
    /* This targets the internal viewer container to ensure it takes full height */
    height: 100%;
}
</style>