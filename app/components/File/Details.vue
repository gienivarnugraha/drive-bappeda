<script setup lang="ts">
import { formatBytes } from '#imports'
import type { Document, Category, Division, Results } from '~/types'
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const { smallerThanLg } = useTailwindBreakpoints()

const { isFileDetailsSlideoverOpen } = useDashboard()

const props = defineProps<{
  document: Document
}>()

const isSubmitting: Ref<boolean> = ref(false)

const setData = (document: Document) => {
  state.document = document
  state.categories = document.categories
  state.divisions = document.divisions
}

onMounted(() => {
  setData(props.document)
})

onUnmounted(() => {
  watcher()
})

const watcher = watch(() => props.document, (doc) => {
  setData(doc)
})

const onEdit = () => {
  state.shouldEdit = !state.shouldEdit
}

const edit = computed(() => state.shouldEdit)

const toast = useToast()

const config = useRuntimeConfig()

const documentPath = config.public.documentPath

const schema = z.object({
  document: z.custom<Document>(),
  categories: z.custom<Category>().array(),
  divisions: z.custom<Division>().array(),
  shouldEdit: z.boolean().optional(),
  shouldDelete: z.boolean().optional()
})

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  document: undefined,
  categories: undefined,
  divisions: undefined,
  shouldEdit: false,
  shouldDelete: false
})

const emits = defineEmits(['update:document'])

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  isSubmitting.value = true

  try {
    const { message } = await $fetch<{ message: string }>('/api/documents', {
      method: 'post',
      body: state
    })

    emits('update:document')

    toast.add({ title: 'Success', description: `${message} `, color: 'success' })
  } catch (error) {
    console.log(error)
  } finally {
    isSubmitting.value = false
    isFileDetailsSlideoverOpen.value = false
  }
}

const onDelete = () => {
  toast.add({
    title: 'Apakah anda yakin?',
    description: 'Berkas akan dihapus secara permanen',
    duration: 0,
    actions: [{
      label: 'Hapus',
      onClick: deleteFile,
      variant: 'solid',
      color: 'error'
    }]
  })
}

const deleteFile = async () => {
  isSubmitting.value = true

  try {
    const { message } = await $fetch<{ message: string }>('/api/documents', {
      method: 'post',
      body: {
        document: state.document,
        shouldDelete: true
      }
    })
    emits('update:document')

    toast.add({ title: 'Success', description: `${message} `, color: 'success' })
  } catch (error) {
    console.log(error)
  } finally {
    isSubmitting.value = false
    isFileDetailsSlideoverOpen.value = false
  }
}
</script>

<template>
  <UDrawer v-model:open="isFileDetailsSlideoverOpen" inset :direction="smallerThanLg ? 'bottom' : 'right'"
    :dismissible="false" :handle="false" :overlay="false" :modal="false" title="File Details"
    description="File description" :ui="{ header: 'flex justify-between items-center' }">
    <UTooltip text="Tutup Panel Detail Berkas">
      <UButton color="neutral" variant="solid" class="fixed bottom-10 right-10"
        :icon="isFileDetailsSlideoverOpen ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'"
        label="Open File" :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
        }" />
    </UTooltip>

    <template #header>
      <p class="text-highlighted max-w-full sm:max-w-60 font-semibold">
        {{ clampCharacters(toTitleCase(document.title), 20) }}
      </p>

      <div class="flex justify-between items-center space-x-1">
        <UButton color="neutral" variant="ghost" :icon="edit ? 'i-lucide-arrow-left' : 'i-lucide-pencil'"
          @click="onEdit" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isFileDetailsSlideoverOpen = false" />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col px-2 overflow-y-auto max-w-full max-h-40 sm:max-h-full sm:max-w-84">
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <img :src="`${documentPath}/${document.metadata.thumbnailSrc}`"
            class="w-full sm:w-60 h-48 sm:h-32 object-cover rounded" alt="File Thumbnail">

          <UFormField v-if="edit" label="Judul File" name="title">
            <UTextarea v-model="document.title" class="w-full" :rows="2" />
          </UFormField>

          <UFormField v-if="edit" label="Deskripsi" name="description">
            <UTextarea v-model="document.description" class="w-full" :rows="4" />
          </UFormField>

          <p v-if="!edit" class="line-clamp-4 text-md">
            {{ document.description }}
          </p>

          <FormDivision v-model="state.divisions" :edit="edit" />

          <FormCategory v-model="state.categories" :edit="edit" />

          <div v-if="edit" class="flex justify-between items-center pt-4">
            <UButton label="Hapus File" color="error" icon="i-lucide-save" @click="onDelete" />
            <UButton label="Simpan Perubahan" icon="i-lucide-save" type="submit" />
          </div>

          <ul v-else class="flex flex-col space-y-1">
            <li class="text-xs">
              <strong>Nama File:</strong>
            </li>
            <li> {{ document.metadata.filename }} </li>
            <li class="text-xs">
              <strong>Ukuran File:</strong>
            </li>
            <li> {{ formatBytes(document.metadata.fileSize || 0) }} </li>
            <li class="text-xs">
              <strong>Tipe File:</strong>
            </li>
            <li> {{ document.metadata.extension }} </li>
            <li class="text-xs">
              <strong>Tanggal Unggah:</strong>
            </li>
            <li> {{ dateToLocale(document.metadata.createdAt) }} </li>
          </ul>
        </UForm>
      </div>
    </template>
  </UDrawer>
</template>
