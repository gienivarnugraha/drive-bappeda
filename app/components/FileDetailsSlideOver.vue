<script setup lang="ts">
import { formatBytes } from '#imports';
import type { Document } from '~/types';

const { smallerThanLg } = useTailwindBreakpoints()

const { isFileDetailsSlideoverOpen } = useDashboard()


const props = defineProps<{
  document: Document
}>()

</script>

<template>
  <UDrawer inset :direction="smallerThanLg ? 'bottom' : 'right'" :handle="false" :overlay="false" :modal="false"
    v-model:open="isFileDetailsSlideoverOpen" title="File Details" description="File description"
    :ui="{ header: 'flex justify-between items-center' }">

    <UTooltip text="Tutup Panel Detail Berkas">
      <UButton color="neutral" variant="ghost" class="absolute right-1"
        :icon="isFileDetailsSlideoverOpen ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'"
        label="Open File" :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
        }" />
    </UTooltip>

    <template #header>
      <p class="text-highlighted max-w-full sm:max-w-60 font-semibold">{{ toTitleCase(document.title) }}</p>

      <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isFileDetailsSlideoverOpen = false" />
    </template>

    <template #body>
      <div class="flex flex-col gap-4 px-2 overflow-y-auto max-w-full max-h-40 sm:max-h-full sm:max-w-64">
        <img :src="`/documents/${document.metadata.thumbnailSrc}`"
          class="w-full sm:w-60 h-48 sm:h-32 object-cover rounded" alt="File Thumbnail" />
        <p class="text-sm line-clamp-4">
          {{ document.metadata.summary }}
        </p>
        <ul class="flex flex-col space-y-1">
          <li class="text-xs"><strong>Nama File:</strong></li>
          <li> {{ document.metadata.filename }} </li>
          <li class="text-xs"><strong>Ukuran File:</strong></li>
          <li> {{ formatBytes(document.metadata.filesize) }} </li>
          <li class="text-xs"><strong>Tipe File:</strong></li>
          <li> {{ document.metadata.extension }} </li>
          <li class="text-xs"><strong>Tanggal Unggah:</strong></li>
          <li> {{ dateToLocale(document.metadata.createdAt) }} </li>
          <li><strong>Kategori:</strong></li>
          <li class="flex space-x-2">
            <UBadge v-for="category in document.categories"> {{ toTitleCase(category.name) }}</UBadge>
          </li>

          <li><strong>Deskripsi:</strong></li>
          <li class="flex space-x-2">
            <UBadge v-for="division in document.divisions"> {{ toTitleCase(division.name) }}</UBadge>
          </li>


        </ul>
      </div>
    </template>
  </UDrawer>

</template>
