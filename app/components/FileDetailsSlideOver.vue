<script setup lang="ts">
import { formatBytes } from '#imports';

const { isFileDetailsSlideoverOpen } = useDashboard()


const props = defineProps<{
  document: any
}>()

const createdAt = dateToLocale(props.document?.metadata?.createdAt)
</script>

<template>
  <UCollapsible v-if="document" v-model:open="isFileDetailsSlideoverOpen" title="File Details"
    :class="isFileDetailsSlideoverOpen ? 'w-full' : ''">

    <div>

      <UButton color="neutral" variant="ghost"
        :icon="isFileDetailsSlideoverOpen ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'" :ui="{
    trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
  }" />


    </div>

    <template #content>
      <div class="flex flex-col gap-4 overflow-y-auto">
        <h2 class="text-md font-bold"> {{ document.title }}</h2>
        <p class="text-sm">
          {{ document.metadata.summary }}
        </p>
        <ul>
          <li class="text-xs"><strong>Nama File:</strong> {{ document.metadata.filename }}</li>
          <li class="text-xs"><strong>Ukuran File:</strong> {{ formatBytes(document.metadata.filesize) }}</li>
          <li class="text-xs"><strong>Tipe File:</strong> {{ document.metadata.extension }}</li>
          <li class="text-xs"><strong>Tanggal Unggah:</strong> {{ createdAt }}</li>
          <!-- <li><strong>Kategori:</strong> {{ document.category }}</li>
          <li><strong>Deskripsi:</strong> {{ document.description }}</li> -->

        </ul>
      </div>
    </template>
  </UCollapsible>

</template>
