<template>
    <div class="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
        <div class="flex items-center space-x-4 p-3 bg-white shadow-lg rounded-lg mb-6 w-full max-w-4xl">

            <div class="flex items-center space-x-2">
                <label for="zoom" class="text-gray-700 font-medium">Zoom:</label>
                <select id="zoom" v-model="currentScale" @change="updateZoom"
                    class="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out">
                    <option value="0.75">75%</option>
                    <option value="1">100%</option>
                    <option value="1.25">125%</option>
                    <option value="1.5">150%</option>
                    <option value="2">200%</option>
                </select>
            </div>

            <div v-if="numPages > 0" class="ml-auto text-gray-600">
                <span class="font-semibold text-blue-600">{{ numPages }}</span> Pages Total
            </div>
        </div>

        <div ref="" class=" w-full max-w-4xl max-h-[80vh] overflow-y-auto p-4 bg-gray-200 shadow-inner rounded-xl">
            <div v-for="n in numPages" :key="n" :id="`page-${n}`"
                class="pdf-page-wrapper mb-6 pb-2 border-b border-gray-300 last:border-b-0 text-center">
                <p class="text-sm text-gray-500 mb-2">Page {{ n }}</p>
            </div>
            <div v-if="numPages === 0" class="text-center text-gray-500 p-8">
                Loading PDF...
            </div>
        </div>
    </div>
</template>

<script setup>
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

const props = defineProps({
    pdfUrl: {
        type: String,
        required: true
    },
    page: Number
});

// --- State Variables ---
let pdfDocument = undefined;

const numPages = ref(0);

// **Zoom state (currentScale)**
const currentScale = ref(1.0);

// --- Rendering Logic ---

/**
 * Renders a specific page onto a newly created canvas.
 * @param {number} pageNum The page number to render.
 */
const renderPage = async (pageNum) => {
    if (!pdfDocument) return;

    const page = await pdfDocument.getPage(pageNum);
    // Use the reactive currentScale for the viewport calculation
    const viewport = page.getViewport({ scale: parseFloat(currentScale.value) });

    // 1. Check/Get Wrapper Element and Clear Existing Content (for re-render on zoom)
    const pageWrapper = document.getElementById(`page-${pageNum}`);
    if (!pageWrapper) return;

    // Important: Clear previous canvas/content before re-rendering
    pageWrapper.innerHTML = `<p class="text-sm text-gray-500 mb-2">Page ${pageNum}</p>`;

    // 2. Create and Configure Canvas Element
    const canvas = document.createElement('canvas');
    canvas.className = 'shadow-xl border border-gray-300 transition-all duration-300 ease-in-out mx-auto';
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // 3. Prepare Render Context
    const renderContext = {
        canvasContext: context,
        viewport: viewport,
    };

    // 4. Render and Append
    await page.render(renderContext).promise;
    pageWrapper.appendChild(canvas);
};

/**
 * Loads the PDF and initiates rendering for all pages.
 */
const loadPDF = async () => {
    try {
        const loadingTask = pdfjsLib.getDocument(props.pdfUrl);
        const pdf = await loadingTask.promise;

        pdfDocument = pdf;
        numPages.value = pdf.numPages;

        // Initial render of all pages
        await renderAllPages();

    } catch (error) {
        console.error('Error loading or rendering PDF:', error);
    }
};

/**
 * Renders all pages based on the current scale.
 */
const renderAllPages = async () => {
    if (pdfDocument) {
        // Render sequentially
        for (let i = 1; i <= numPages.value; i++) {
            await renderPage(i);
        }
    }
};

// --- Zoom Function ---

const updateZoom = () => {
    // Trigger a full re-render when the zoom level changes
    renderAllPages();
};


// --- Initialization ---

onMounted(() => {
    loadPDF();

    if (props.page) {
        const pageElement = document.getElementById(`page-${props.page}`);
        if (pageElement) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});
</script>

<style scoped>
/* No scoped styles needed as Tailwind handles everything, but keep it for structure */
</style>