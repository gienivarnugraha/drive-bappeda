<script setup lang="ts">
import { formatBytes } from '#imports';

const { isFileDetailsSlideoverOpen } = useDashboard()


defineProps<{
  document: any
}>()
</script>

<template>
  <UCollapsible v-model:open="isFileDetailsSlideoverOpen" title="File Details"
    :class="isFileDetailsSlideoverOpen ? 'min-w-96' : ''">
    <UButton color="neutral" variant="ghost" icon="i-lucide-panel-right-close" :ui="{
      trailingIcon: 'group-data-[state=open]:rotateY(180deg) transition-transform duration-200'
    }" />

    <template #content>
      <div class="flex flex-col gap-4">
        <h2 class="text-md font-bold"> {{ document.title }}</h2>

        <p class="text-md">
          {{ document.metadata.summary }}
        </p>
        <ul>
          <li><strong>Nama File:</strong> {{ document.metadata.filename }}</li>
          <li><strong>Ukuran File:</strong> {{ formatBytes(document.metadata.filesize) }} MB</li>
          <li><strong>Tipe File:</strong> {{ document.metadata.extension }}</li>
          <li><strong>Tanggal Unggah:</strong> {{ new Date(document.createdAt).toLocaleDateString() }}</li>
          <!-- <li><strong>Kategori:</strong> {{ document.category }}</li>
          <li><strong>Deskripsi:</strong> {{ document.description }}</li> -->

        </ul>
      </div>
    </template>
  </UCollapsible>
</template>
