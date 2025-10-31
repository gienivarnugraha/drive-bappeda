<script setup lang="ts">
import { formatBytes } from '#imports';
import type { Document as DocumentTypes } from '~/types';
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { useItems } from '~/composables/useItems'

const { smallerThanLg } = useTailwindBreakpoints()

const { isFileDetailsSlideoverOpen } = useDashboard()

const { divisions, categories } = await useItems()


const props = defineProps<{
  document: DocumentTypes
}>()

const edit: Ref<boolean> = ref(false)
const isSubmitting: Ref<boolean> = ref(false)
const toast = useToast()

const schema = z.object({
  document: z.custom<DocumentTypes>(),
  category_id: z.number().array(),
  division_id: z.number().array(),
  shouldEdit: z.boolean().optional(),
  shouldDelete: z.boolean().optional(),
})


type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  document: undefined,
  category_id: undefined,
  division_id: undefined,
  shouldEdit: false,
  shouldDelete: false,
})

const onEdit = () => {
  edit.value = !edit.value

  if (edit.value) {
    state.document = props.document

  } else {
    state.document = undefined
  }
}

const onSubmit = async (data: FormSubmitEvent<Schema>) => {
  isSubmitting.value = true

  try {
    const response = await $fetch('/api/documents', {
      method: 'post',
      body: data,
    })

    toast.add({ title: 'Success', description: `Sucess adding file to datalake `, color: 'success' })

  } catch (error) {
    console.log(error)
  } finally {
    isSubmitting.value = false
  }
}


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

      <div class="flex justify-between items-center">
        <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isFileDetailsSlideoverOpen = false" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-pencil" @click="onEdit" />

      </div>
    </template>

    <template #body>
      <div class="flex flex-col px-2 overflow-y-auto max-w-full max-h-40 sm:max-h-full sm:max-w-64">
        <UForm v-if="edit" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">

          <UFormField label="Judul File" name="title">
            <UInput v-model="state.document?.title" />
          </UFormField>

          <UFormField label="Ringkasan" name="summary">
            <UTextarea v-model="state.document?.metadata.summary" :rows="4" />
          </UFormField>

          <UFormField label="Bidang" name="divisions">
            <UCheckboxGroup indicator="hidden" size="sm" variant="card" :items="divisions" value-key="id"
              label-key="name" v-model="state.division_id" name="division_id"
              :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }" />
          </UFormField>

          <UFormField label="Kategori" name="categories">
            <UCheckboxGroup indicator="hidden" size="sm" variant="card" :items="categories" value-key="id"
              label-key="name" v-model="state.category_id" name="category_id"
              :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }" />
          </UFormField>


          <div class="flex justify-end pt-4">
            <UButton type="submit" label="Simpan Perubahan" icon="i-lucide-save" />
          </div>
        </UForm>

        <div v-else class="flex flex-col gap-4 overflow-y-auto ">

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
      </div>
    </template>
  </UDrawer>

</template>
