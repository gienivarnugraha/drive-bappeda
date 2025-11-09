<script setup lang="ts">
import { formatBytes } from '#imports'
import type { Results, Category, Division, Document } from '~/types'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useItems } from '~/composables/useItems'
import { z } from 'zod'

const { smallerThanLg } = useTailwindBreakpoints()

const { isFileDetailsSlideoverOpen } = useDashboard()

const { divisions, categories } = await useItems()


const props = defineProps<{
  document: Results
}>()

const isSubmitting: Ref<boolean> = ref(false)

const setData = (item: Results, clear: boolean = false) => {
  console.log(item)
  state.title = clear ? '' : item.title
  state.description = clear ? '' : item.description
  state.categories = clear ? [] : deepClone(item.categories)
  state.divisions = clear ? [] : deepClone(item.divisions)
}

onUnmounted(() => {
  setData(props.document, true)
  watcher()
})

const watcher = watch(() => props.document, (doc) => {
  setData(doc)
})

const isEditing: Ref<boolean> = ref(false)

const toast = useToast()

const config = useRuntimeConfig()

const storageUrl = config.public.storageUrl

const schema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  categories: z.custom<Category>().array(),
  divisions: z.custom<Division>().array(),
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  title: '',
  description: '',
  categories: [],
  divisions: [],
})

const emits = defineEmits(['update:document'])

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  isSubmitting.value = true

  try {
    const { message } = await $fetch<{ message: string }>('/api/documents', {
      method: 'put',
      body: {
        documentId: props.document.id,
        ...state
      }
    })

    emits('update:document')

    toast.add({ title: 'Success', description: `${message} `, color: 'success' })
  } catch (error) {
    console.log(error)
  } finally {
    isSubmitting.value = false
    isEditing.value = false
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
      method: 'delete',
      body: {
        documentId: props.document.id
      }
    })

    emits('update:document')

    toast.add({ title: 'Success', description: `${message} `, color: 'success' })
  } catch (error) {
    console.log(error)
  } finally {
    isSubmitting.value = false
    isEditing.value = false
    isFileDetailsSlideoverOpen.value = false
  }
}
</script>

<template>
  <UDrawer v-model:open="isFileDetailsSlideoverOpen" inset :direction="smallerThanLg ? 'bottom' : 'right'"
    :dismissible="smallerThanLg" :handle="smallerThanLg" :overlay="false" :modal="false" title="File Details"
    description="File description" :ui="{ header: 'flex justify-between items-center' }">
    <UTooltip text="Tutup Panel Detail Berkas">
      <UButton variant="solid" class="fixed bottom-10 right-10"
        :icon="isFileDetailsSlideoverOpen ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'"
        label="Buka File" :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
        }" />
    </UTooltip>

    <template #header>
      <p class="text-highlighted max-w-full sm:max-w-60 font-semibold">
        {{ document.title }}
      </p>

      <div class="flex justify-between items-center space-x-1">
        <UButton color="neutral" variant="ghost" :icon="isEditing ? 'i-lucide-arrow-left' : 'i-lucide-pencil'"
          @click="isEditing = !isEditing" :ui="{
            trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
          }" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isFileDetailsSlideoverOpen = false" />
      </div>

    </template>

    <template #body>
      <div class="flex flex-col px-2 overflow-y-auto  max-w-full  lg:max-w-84">
        <UForm :schema="schema" :state="state" class="space-y-4 " @submit="onSubmit">
          <img :src="`${storageUrl}/${document.metadata.thumbnailSrc}`"
            class="w-full lg:w-60 h-48 lg:h-32 object-cover rounded" alt="File Thumbnail">

          <UFormField v-if="isEditing" label="Judul File" name="title">
            <UTextarea v-model="state.title" class="w-full" :rows="2" />
          </UFormField>

          <UFormField v-if="isEditing" label="Deskripsi" name="description">
            <UTextarea v-model="state.description" class="w-full" :rows="4" />
          </UFormField>

          <UTooltip>
            <p v-if="!isEditing" class="line-clamp-4 text-md">
              {{ state.description }}
            </p>

            <template #content>
              <p class="max-w-96 text-md p-4 rounded bg-slate-400 dark:bg-slate-500">
                {{ state.description }}
              </p>

            </template>
          </UTooltip>

          <FormItemsSelector v-model="state.divisions" :options="divisions" title="Bidang" :edit="isEditing" />
          <FormItemsSelector v-model="state.categories" :options="categories" title="Kategori" :edit="isEditing" />

          <UButton v-if="isEditing" label="Simpan Perubahan" icon="i-lucide-save" type="submit" />

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
            <li> {{ dateToLocale(document.created_at) }} </li>
          </ul>
        </UForm>
      </div>
    </template>

    <template #footer>
      <div v-if="!isEditing" class="flex justify-end max-w-full space-x-4 items-center pt-4">
        <UButton label="Hapus File" color="error" icon="i-lucide-save" @click="onDelete" />
        <UButton label="Edit File" icon="i-lucide-pencil" @click="isEditing = !isEditing" />
      </div>

    </template>
  </UDrawer>
</template>
