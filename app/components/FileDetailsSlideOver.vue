<script setup lang="ts">
import { formatBytes } from '#imports';

const { isFileDetailsSlideoverOpen } = useDashboard()


const props = defineProps<{
  document: any
}>()

</script>

<template>
  <UCollapsible class="px-4" v-if="document" v-model:open="isFileDetailsSlideoverOpen" title="File Details"
    :class="isFileDetailsSlideoverOpen ? 'w-full' : ''">

    <UButton color="neutral" variant="ghost"
      :icon="isFileDetailsSlideoverOpen ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'" :ui="{
    trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
  }" />


    <template #content>
      <div class="flex flex-col gap-4 overflow-y-auto">
        <img :src="`/documents/${document.metadata.thumbnailSrc}`" class="max-w-64 h-auto rounded"
          alt="File Thumbnail" />
        <h2 class="text-md font-bold"> {{ document.title }}</h2>
        <p class="text-sm line-clamp-3">
          {{ document.metadata.summary }}
        </p>
        <ul>
          <li class="text-xs"><strong>Nama File:</strong> {{ document.metadata.filename }}</li>
          <li class="text-xs"><strong>Ukuran File:</strong> {{ formatBytes(document.metadata.filesize) }}</li>
          <li class="text-xs"><strong>Tipe File:</strong> {{ document.metadata.extension }}</li>
          <li class="text-xs"><strong>Tanggal Unggah:</strong> {{ dateToLocale(document.metadata.createdAt) }}</li>
          <!-- <li><strong>Kategori:</strong> {{ document.category }}</li>
          <li><strong>Deskripsi:</strong> {{ document.description }}</li> -->

        </ul>
      </div>
    </template>
  </UCollapsible>

</template>
