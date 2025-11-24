<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, StepperItem } from '#ui/types'
import type { FileMeta } from '#shared/types'
import { sanitizeFileName, getFileExtension, toTitleCase } from '#shared/utils'
import { generateThumbnail } from '~/utils/pdf'
import { ALLOWED_EXTENSION_TYPES } from '#shared/utils'

import { useItems } from '~/composables/useItems'

const addModalOpen: Ref<boolean> = ref(false)

const { divisions: availableDivisions, categories: availableCategories } = await useItems()

const toast = useToast()

const isProcessing = ref(false)

const schema = z.object({
  files: z.instanceof(File).array(),
  categories: z.number().array(),
  divisions: z.number().array()
})

const thumbnails: Ref<{ filename: string, blob: Blob }[]> = ref([])

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  files: undefined,
  categories: undefined,
  divisions: undefined
})

const successCount = ref(0)

const filesCount = computed(() => state.files?.length ?? 0)


async function upload(files: File[]) {
  const formData = new FormData()

  files.forEach((file, index) => {
    formData.append('file', file, `${sanitizeFileName(file.name, false)}`)

    if (thumbnails.value.length > 0) {
      // @ts-ignore
      formData.append('thumbnail', thumbnails.value[index].blob, thumbnails.value[index].filename)
    }
  })

  try {
    const { message, filenames } = await $fetch('/api/upload', {
      method: 'post',
      body: formData
    })

    return filenames
  } catch (error: any) {
    console.error(error)
    toast.add({ title: 'Error', description: `${error.statusMessage}`, color: 'error' })
  }
}


async function submit(data: Omit<Schema, 'files'> & { filesmeta: FileMeta[] | undefined }) {
  try {
    await $fetch('/api/documents', {
      method: 'post',
      body: data
    })

  } catch (error) {
    console.error(error)
    toast.add({ title: 'Error', description: 'Something went wrong', color: 'error' })
  }
}

const onChange = () => {
  const shouldGenerateThumbnails = ['application/pdf']

  state.files?.forEach((file) => {
    if (shouldGenerateThumbnails.includes(file.type)) {
      file.arrayBuffer().then(async (buff) => {
        const thumbnail = await generateThumbnail(new Uint8Array(buff))

        thumbnail?.toBlob(function (blob) {
          thumbnails.value.push({
            filename: `${sanitizeFileName(file.name)}.png`,
            // @ts-ignore
            blob
          })
        }, 'image/png', 1)
      })
    }

  })
}


async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { files, ...data } = event.data

  isProcessing.value = true

  try {
    await upload(files)

    const filesmeta = state.files?.map((file: File) => {
      return {
        createdAt: file.lastModified,
        size: file.size,
        type: file.type,
        name: sanitizeFileName(file.name, false)
      }
    })

    if (files && files.length > 0) {
      await submit({
        filesmeta,
        ...data
      })
    }

    // isProcessing.value = false
  } catch (error) {
    console.error('error uploading files', error)
    isProcessing.value = false
  }

  return
}
</script>
<template>
  <UModal v-model:open="addModalOpen" title="Tambah Dokumen" description="Tambah dokumen ke data lake">
    <UButton color="neutral" variant="ghost" square icon="i-lucide-plus" />

    <template #body>
      <LazyFileProcess v-if="isProcessing" :is-processing="isProcessing" v-model="successCount"
        :files-count="filesCount" @close="isProcessing = false" />

      <UForm v-else :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField>
          <UFileUpload v-model="state.files" icon="i-lucide-files" reset label="Drop file anda disini"
            :description="`Hanya file ${ALLOWED_EXTENSION_TYPES('documents').join(', ')}`" layout="list" multiple
            class="w-full min-h-48" @change="onChange">

            <template #actions="{ open }">
              <UButton label="Pilih File" icon="i-lucide-upload" color="neutral" variant="outline" @click="open()" />
            </template>

            <template #files-top="{ open, files }">
              <div v-if="files?.length" class="my-2 w-full flex items-center justify-between">
                <p class="font-bold">
                  Files ({{ files?.length }})
                </p>

                <UButton icon="i-lucide-plus" label="Add more" color="neutral" variant="outline" @click="open()" />
              </div>
            </template>
          </UFileUpload>
        </UFormField>

        <UFormField name="divisions" :label="`Bidang (Terpilih ${state.divisions?.length ?? 0})`"
          description="Bidang yang terkait dengan dokumen ini">
          <UCheckboxGroup v-if="availableDivisions" v-model="state.divisions" indicator="hidden" size="sm"
            variant="card" :items="availableDivisions" value-key="id" label-key="name" name="divisions"
            :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }">
            <template #label="{ item }">
              <span class="text-xs">{{ toTitleCase(item.name) }}</span>
            </template>
          </UCheckboxGroup>

          <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <USkeleton v-for="value in 4" class="h-8 w-full" />
          </div>
        </UFormField>

        <UFormField name="categories" :label="`Kategori (Terpilih ${state.categories?.length ?? 0})`"
          description="Kategori yang terkait dengan dokumen ini">
          <UCheckboxGroup v-if="availableCategories" v-model="state.categories" indicator="hidden" size="sm"
            variant="card" :items="availableCategories" value-key="id" label-key="name" name="categories"
            :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }">
            <template #label="{ item }">
              <span class="text-xs">{{ toTitleCase(item.name) }}</span>
            </template>
          </UCheckboxGroup>

          <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <USkeleton v-for="value in 4" class="h-8 w-full" />
          </div>
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="addModalOpen = false" />
          <UButton label="Create" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
