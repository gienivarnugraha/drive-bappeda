<template>
    <UDashboardGroup unit="rem">
        <UDashboardSidebar id="default" v-model:open="showThumbnails" collapsible class="bg-elevated/25 min-h-full "
            :collapsed-size="0" :default-size="10" :ui="{
                header: 'lg:border-b lg:border-default h-auto',
                footer: 'lg:border-t lg:border-default'
            }">
            <template #header="{ collapsed }">
                <Logo :collapsed="collapsed" />
            </template>

            <template #default="{ collapsed }">
                <div v-if="!collapsed" class="w-48 bg-white shadow-lg rounded-lg p-3 mr-4 overflow-y-auto shrink-0"
                    :class="{ 'border-r border-gray-200': !collapsed }">
                    <h3 class="font-bold text-lg text-gray-800 mb-3">Thumbnails</h3>
                    <div v-for="n in numPages" :key="`thumb-${n}`" :class="[
                        'thumbnail-wrapper p-2 mb-3 cursor-pointer rounded-md transition-all duration-200 ease-in-out',
                        { 'bg-blue-100 ring-2 ring-blue-500': thumbnailCurrentPage === n, 'hover:bg-gray-50': thumbnailCurrentPage !== n }
                    ]" @click="scrollToPage(n)">
                        <p class="text-xs text-gray-500 mb-1">Page {{ n }}</p>
                        <div :id="`thumbnail-canvas-${n}`"
                            class="thumbnail-canvas-container flex justify-center items-center">
                        </div>
                    </div>
                </div>

                <div v-else class=" flex flex-col justify-center gap-2">
                    <UDashboardSidebarCollapse icon="i-lucide-list" />
                </div>

            </template>

            <template #footer="{ collapsed }">
                <span class="text-xs text-center">{{ collapsed ? '©' : 'copyright' }} 2024</span>
            </template>
        </UDashboardSidebar>

        <UDashboardPanel id="main">
            <template #header>
                <UDashboardNavbar>
                    <template #leading>
                        <UDashboardSidebarCollapse icon="i-lucide-list" />

                        <UTooltip text="Kembali">
                            <UButton v-if="!isHome" variant="ghost" color="neutral" icon="i-lucide-chevron-left"
                                to="/home" />
                        </UTooltip>

                        <UFieldGroup>
                            <UButton icon="i-lucide-chevron-up" :disabled="currentPage === 1" @click="goToPrevPage"
                                variant="ghost" />
                            <UInput :model-value="currentPage" class="w-16 text-center" variant='ghost'>
                                <template #trailing>
                                    <span class='text-xs text-gray-500'> of {{ numPages }}</span>
                                </template>
                            </UInput>
                            <UButton icon="i-lucide-chevron-down" :disabled="currentPage === numPages"
                                @click="goToNextPage" variant="ghost" />
                        </UFieldGroup>
                    </template>

                    <template #trailing>
                        <p v-if="smAndLarger" class="">
                            {{ clampCharacters(filename, smAndLarger ? 25 : 10) }}
                        </p>
                    </template>

                    <template #right>
                        <UPopover :dismissible="false" :ui="{ content: 'p-4' }">
                            <UButton v-if="!smAndLarger" icon="i-lucide-settings" color="neutral" variant="ghost" />

                            <template #content="{ close }">
                                <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="close" />

                                <div class="flex items-center gap-4">
                                    <UFieldGroup>
                                        <UButton icon="i-lucide-zoom-in" @click="zoom('in')"
                                            :disabled="currentScale === '2.0'" variant="ghost" color="neutral" />
                                        <USelect v-model="currentScale" :options="zoomOptions" @change="updateZoom"
                                            size="sm" class="w-16 z-20" variant="ghost" />
                                        <UButton icon="i-lucide-zoom-out" :disabled="currentScale === '0.75'"
                                            @click="zoom('out')" variant="ghost" color="neutral" />
                                    </UFieldGroup>
                                    <div class="w-1 h-full border-l border-gray-700 dark:border-gray-500"></div>
                                    <UColorModeButton />
                                </div>
                            </template>
                        </UPopover>

                        <UFieldGroup v-if="smAndLarger">
                            <UButton icon="i-lucide-zoom-in" @click="zoom('in')" :disabled="currentScale === '2.0'"
                                variant="ghost" />
                            <USelect v-model="currentScale" :items="zoomOptions" @change="updateZoom" size="sm"
                                class="w-16" variant="ghost" :ui="{ content: 'min-w-fit' }" />
                            <UButton icon="i-lucide-zoom-out" :disabled="currentScale === '0.75'" @click="zoom('out')"
                                variant="ghost" />
                        </UFieldGroup>

                        <UColorModeButton v-if="smAndLarger" />

                        <!-- <div class="flex items-center space-x-2 ml-auto">
                            <UFieldGroup>
                                <UInput v-model="searchTerm" placeholder="Search text..." @keydown.enter="performSearch"
                                    class="w-48" size="sm">
                                    <template #trailing>
                                        <UButton icon="i-lucide-search" color="primary" variant="ghost" size="sm"
                                            :disabled="!searchTerm" />
                                    </template>
    </UInput>
    <UButton icon="i-lucide-chevron-up" @click="navigateSearchResult(-1)"
        :disabled="!searchResults.length || currentSearchResultIndex === 0" color="gray" variant="outline" size="sm" />
    <UButton icon="i-lucide-chevron-down" @click="navigateSearchResult(1)"
        :disabled="!searchResults.length || currentSearchResultIndex === searchResults.length - 1" color="gray"
        variant="outline" size="sm" />
    </UFieldGroup>
    <span v-if="searchResults.length" class="text-sm text-gray-600 whitespace-nowrap">
        {{ currentSearchResultIndex + 1 }} / {{ searchResults.length }}
    </span>
    </div> -->

                    </template>
                </UDashboardNavbar>
            </template>

            <template #body>
                <div class="flex w-full max-w-6xl max-h-[85vh]">


                    <div ref="pages-container"
                        class=" grow max-h-[85vh] overflow-y-scroll p-4 bg-gray-200 dark:bg-gray-800 shadow-inner rounded-xl relative"
                        @scroll="updateCurrentPageOnScroll">
                        <div v-for="n in numPages" :key="`main-page-${n}`" :id="`page-${n}`"
                            class="pdf-page-wrapper mb-6 pb-2 border-b border-gray-300 last:border-b-0 text-center relative">
                            <p class="text-sm text-gray-500 mb-2">Page {{ n }}</p>
                        </div>
                        <div v-if="numPages === 0 && !loadingError" class="text-center text-gray-500 p-8">
                            Loading PDF...
                        </div>
                        <div v-if="loadingError" class="text-center text-red-600 p-8 font-semibold">
                            Error loading PDF: {{ loadingError }}
                        </div>
                    </div>
                </div>
            </template>
        </UDashboardPanel>

    </UDashboardGroup>

    <!-- <div class="flex flex-col items-center p-4 min-h-screen">
        <div class="flex flex-row items-center p-4 justify-between shadow-lg rounded-lg mb-6 w-full max-w-6xl ">
        </div>
    </div> -->
</template>

<script setup>
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Make sure to import pdf.worker.min.js and pdf.js for text layer functionality
// import 'pdfjs-dist/web/pdf_viewer.css'; // Basic PDF.js viewer CSS for text layer
import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`


// --- Props Definition ---
const props = defineProps({
    pdfUrl: {
        type: String,
        required: true,
    },
    page: {
        type: [Number, String],
        default: 1,
    }
});

const { smAndLarger } = useTailwindBreakpoints()

const route = useRoute()
const filename = route.query.filename
const isHome = computed(() => route.name === 'home')

let pdfDocument = undefined;
// --- State Variables ---
const pagesContainer = useTemplateRef('pages-container');
const currentPage = ref(1);
const thumbnailCurrentPage = ref(1); // Separate state for thumbnail highlight
const numPages = ref(0);
const loadingError = ref(null);

// Zoom State
const currentScale = ref('1.0');
const zoomOptions = [
    { label: '75%', value: '0.75' },
    { label: '100%', value: '1.0' },
    { label: '125%', value: '1.25' },
    { label: '150%', value: '1.5' },
    { label: '200%', value: '2.0' },
];

const zoom = (type) => {
    // 1. Find the current index based on the currentScale's value
    let currentZoomIndex = zoomOptions.findIndex((option) => currentScale.value === option.value);

    // If the current scale is not found (shouldn't happen), default to 100% (index 1)
    if (currentZoomIndex === -1) {
        currentZoomIndex = 1;
    }

    let newIndex = currentZoomIndex;

    // 2. Calculate the new index
    if (type === 'in') {
        newIndex += 1;
    } else if (type === 'out') {
        newIndex -= 1;
    }

    // 3. Constrain the new index within the array bounds
    const maxIndex = zoomOptions.length - 1;
    const constrainedIndex = Math.min(Math.max(0, newIndex), maxIndex);

    // 4. Update the reactive currentScale value
    currentScale.value = zoomOptions[constrainedIndex].value;

    updateZoom()
};

// Thumbnail State
const showThumbnails = ref(true);
const thumbnailScale = 0.2; // Smaller scale for thumbnails

// Search State
const searchTerm = ref('');
const searchResults = ref([]); // Stores { pageNum: N, rects: [] }
const currentSearchResultIndex = ref(0);
const findController = ref(null); // PDF.js find controller instance


// --- Rendering Logic ---

const renderPage = async (pageNum, containerId, scale, isThumbnail = false) => {
    if (!pdfDocument) return;

    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale: parseFloat(scale) });

    const pageWrapper = document.getElementById(containerId);
    if (!pageWrapper) return;

    // Clear previous content but preserve page label for main pages
    if (!isThumbnail) {
        pageWrapper.innerHTML = `<p class="text-sm text-gray-500 mb-2">Page ${pageNum}</p>`;
    } else {
        pageWrapper.innerHTML = ''; // Clear completely for thumbnails, label is outside
    }

    // Create Canvas Element
    const canvas = document.createElement('canvas');
    canvas.className = isThumbnail ? 'block w-full h-auto border border-gray-200' : 'shadow-xl border border-gray-300 transition-all duration-300 ease-in-out mx-auto';
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = { canvasContext: context, viewport: viewport };

    await page.render(renderContext).promise;
    pageWrapper.appendChild(canvas);

    // --- Text Layer for Main Pages (Required for Search) ---
    if (!isThumbnail) {
        const textContent = await page.getTextContent();
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'textLayer absolute top-0 left-0 right-0 bottom-0 overflow-hidden opacity-0'; // Hidden by default

        // Set styles for text layer to match viewport
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.height = `${viewport.height}px`;

        pageWrapper.appendChild(textLayerDiv);

        const textLayer = new TextLayerBuilder({
            pdfPage: textContent,
        });
        // textLayer.setTextContent(textContent);
        textLayer.render({
            viewport
        });
    }
};

const renderAllPages = async () => {
    if (pdfDocument) {
        for (let i = 1; i <= numPages.value; i++) {
            await renderPage(i, `page-${i}`, currentScale.value, false);
            if (showThumbnails.value) {
                await renderPage(i, `thumbnail-canvas-${i}`, thumbnailScale, true);
            }
        }
    }
};

const loadPDF = async () => {
    loadingError.value = null;
    pdfDocument = null;
    numPages.value = 0;
    currentPage.value = 1;
    thumbnailCurrentPage.value = 1;
    searchResults.value = [];
    currentSearchResultIndex.value = 0;

    // Clear previous content in containers
    // if (pagesContainer.value) pagesContainer.value.innerHTML = '';


    try {
        const loadingTask = pdfjsLib.getDocument(props.pdfUrl);
        const pdf = await loadingTask.promise;

        pdfDocument = pdf;
        numPages.value = pdf.numPages;

        // Wait for Vue to render the v-for elements before trying to append canvases
        await nextTick();
        await renderAllPages();

        const pageNum = Math.min(Math.max(1, parseInt(props.page)), numPages.value);
        scrollToPage(pageNum, 'instant');

    } catch (error) {
        console.error('Error loading or rendering PDF:', error);
        loadingError.value = error.message || 'Could not load the PDF document.';
    }
};

// --- Navigation Functions (Scroll Logic) ---

const scrollToPage = (pageNum, behavior = 'smooth') => {
    if (pageNum < 1 || pageNum > numPages.value || !pagesContainer.value) return;

    const pageElement = document.getElementById(`page-${pageNum}`);
    const container = pagesContainer.value;

    if (pageElement && container) {
        const scrollPosition = pageElement.offsetTop - container.offsetTop;

        container.scrollTo({
            top: scrollPosition,
            behavior: behavior,
        });
        currentPage.value = pageNum;
        thumbnailCurrentPage.value = pageNum; // Sync thumbnail highlight
    }
};

const goToNextPage = () => {
    if (currentPage.value < numPages.value) {
        scrollToPage(currentPage.value + 1);
    }
};

const goToPrevPage = () => {
    if (currentPage.value > 1) {
        scrollToPage(currentPage.value - 1);
    }
};

const updateZoom = async () => {
    await renderAllPages();
    // After re-render, scroll back to the current page
    setTimeout(() => scrollToPage(currentPage.value, 'instant'), 50);
};

const updateCurrentPageOnScroll = () => {
    const container = pagesContainer.value;
    if (!container || numPages.value === 0) return;

    const scrollThreshold = 50;
    let foundPage = 1;

    for (let i = 1; i <= numPages.value; i++) {
        const pageElement = document.getElementById(`page-${i}`);
        if (pageElement) {
            const pageTopRelativeToContainer = pageElement.offsetTop - container.scrollTop;
            if (pageTopRelativeToContainer <= scrollThreshold) {
                foundPage = i;
            } else {
                break;
            }
        }
    }
    currentPage.value = foundPage;
    thumbnailCurrentPage.value = foundPage; // Sync thumbnail highlight
};

// --- Search Logic ---
const clearHighlights = () => {
    const highlightElements = pagesContainer.value.querySelectorAll('.highlight');
    highlightElements.forEach(el => el.remove());
};

const performSearch = async () => {
    if (!searchTerm.value || !pdfDocument) {
        searchResults.value = [];
        currentSearchResultIndex.value = 0;
        clearHighlights();
        return;
    }

    clearHighlights();
    searchResults.value = [];
    currentSearchResultIndex.value = 0;

    for (let pageNum = 1; pageNum <= numPages.value; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const findMatches = [];

        // Simple case-insensitive search
        const regex = new RegExp(searchTerm.value, 'gi');

        textContent.items.forEach(item => {
            let match;
            while ((match = regex.exec(item.str)) !== null) {
                // We found a match in this text item
                // For highlighting, we'll draw a div over the text item's position
                findMatches.push({
                    page: pageNum,
                    transform: item.transform, // Matrix for position/scale
                    width: item.width,
                    height: item.height,
                    offset: match.index, // Start of match within item.str
                    length: match[0].length, // Length of the matched string
                    textItem: item // Keep reference to original text item for more accurate highlighting
                });
            }
        });
        searchResults.value.push(...findMatches);
    }

    if (searchResults.value.length > 0) {
        displaySearchResult(0);
    } else {
        alert('No results found.');
    }
};

const displaySearchResult = (index) => {
    if (searchResults.value.length === 0) return;

    clearHighlights(); // Clear previous highlights before showing new one
    currentSearchResultIndex.value = index;
    const result = searchResults.value[index];

    scrollToPage(result.page, 'smooth');

    nextTick(async () => {
        // Wait for scroll and page rendering to complete
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay

        const pageWrapper = document.getElementById(`page-${result.page}`);
        if (!pageWrapper) return;

        // Get the current viewport for the page to correctly position highlights
        const page = await pdfDocument.getPage(result.page);
        const scaleValue = parseFloat(currentScale.value);
        const viewport = page.getViewport({ scale: scaleValue });

        // Create a highlight div
        const highlightDiv = document.createElement('div');
        highlightDiv.className = 'highlight absolute bg-yellow-300 opacity-70 rounded pointer-events-none z-20';

        // PDF.js text item transform is [scaleX, skewY, skewX, scaleY, offsetX, offsetY]
        // To get the actual position on the rendered canvas/div, we need to transform.
        // This is simplified and might need adjustment for perfect alignment
        const textItemTransform = result.textItem.transform;
        const itemX = textItemTransform[4];
        const itemY = textItemTransform[5];
        const itemWidth = result.textItem.width;
        const itemHeight = result.textItem.height;

        // Adjust for the matched portion if the text item is longer than the match
        const charWidth = itemWidth / result.textItem.str.length;
        const matchStartX = itemX + (result.offset * charWidth);
        const matchWidth = result.length * charWidth;

        // Apply viewport scale and position
        highlightDiv.style.left = `${matchStartX * scaleValue}px`;
        highlightDiv.style.top = `${(viewport.height - itemY - itemHeight) * scaleValue}px`; // PDF Y-coordinates are inverted
        highlightDiv.style.width = `${matchWidth * scaleValue}px`;
        highlightDiv.style.height = `${itemHeight * scaleValue}px`;

        pageWrapper.appendChild(highlightDiv);
        highlightDiv.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll highlight into view
    });
};

const navigateSearchResult = (direction) => {
    let newIndex = currentSearchResultIndex.value + direction;
    if (newIndex >= 0 && newIndex < searchResults.value.length) {
        displaySearchResult(newIndex);
    }
};


// --- Lifecycle and Watchers ---

onMounted(() => {
    loadPDF();
});

// Re-render thumbnails if showThumbnails changes (only applies if PDF is already loaded)
watch(showThumbnails, async (newValue) => {
    if (newValue && pdfDocument && numPages.value > 0) {
        await nextTick(); // Ensure the thumbnail divs are in the DOM
        for (let i = 1; i <= numPages.value; i++) {
            await renderPage(i, `thumbnail-canvas-${i}`, thumbnailScale, true);
        }
    }
});
</script>

<style scoped>
/* Scoped styles for .textLayer and .highlight */

/* Base styles for the TextLayer (from pdf.viewer.css, but customized for visibility) */
.textLayer {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    opacity: 0.2;
    /* Make it slightly visible for debugging, or 0 for hidden */
    line-height: 1;
    font-family: sans-serif;
    user-select: text;
    /* Allow text selection */
    -webkit-user-select: text;
    -moz-user-select: text;
}

.textLayer>div {
    color: transparent;
    /* Hide the actual text but keep its structure */
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
}

/* Highlight style for search results */
.highlight {
    position: absolute;
    background-color: #f7e75e;
    /* Yellow highlight */
    opacity: 0.6;
    border-radius: 2px;
    pointer-events: none;
    /* Allows interaction with elements beneath */
    z-index: 20;
}

/* Highlight style for currently active search result */
.highlight.current {
    background-color: #ff9600;
    /* Orange for active highlight */
}

/* Add some basic styles for the thumbnail wrapper */
.thumbnail-wrapper {
    border: 1px solid #e2e8f0;
}

.thumbnail-wrapper.bg-blue-100 {
    background-color: #eff6ff;
    /* Tailwind blue-100 */
}

.thumbnail-wrapper.ring-2 {
    --tw-ring-color: #3b82f6;
    /* Tailwind blue-500 */
}

.thumbnail-canvas-container {
    /* Ensure canvas is centered within its div */
    min-height: 50px;
    /* Placeholder height if canvas not loaded yet */
    background-color: #f0f0f0;
    border-radius: 4px;
}

.thumbnail-canvas-container canvas {
    max-width: 100%;
    height: auto;
    display: block;
    /* Remove extra space below canvas */
}
</style>