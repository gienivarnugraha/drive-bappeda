<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Category, Division } from '~/types'
import { getFilenameWithoutExtension } from '../../utils/index';

const openModal = ref(false)

const { data: categories, status: categoriesStatus } = await useFetch<Category[]>('/api/categories')

const { data: divisions, status: divisionsStatus } = await useFetch<Division[]>('/api/divisions')

const fileUploading = ref(false)

const isSubmitting = ref(false)

const schema = z.object({
  files: z.instanceof(File).array(),
  category_id: z.number().array(),
  division_id: z.number().array(),
})

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  files: undefined,
  category_id: undefined,
  division_id: undefined,
})

async function upload(files: File[]) {
  fileUploading.value = true

  const formData = new FormData();

  for (const file of files) {
    //@ts-ignore
    formData.append('file', file);

  }

  for (const thumbnail of thumbnails.value) {
    //@ts-ignore
    formData.append('thumbnail', thumbnail.blob, `${thumbnail.filename}.png`);

  }

  try {
    const { message, filenames } = await $fetch('/api/upload', {
      method: 'post',
      body: formData
    })

    console.log('filenames', filenames)

    toast.add({ title: 'Success', description: `${message}`, color: 'success' })

    return filenames
  } catch (error) {
    console.log(error)
  } finally {
    fileUploading.value = false
  }
}

async function submit(data: Omit<Schema, 'files'> & { filenames: string[] | undefined }) {
  isSubmitting.value = true

  try {
    const { message } = await $fetch('/api/documents', {
      method: 'post',
      body: data
    })

    console.log('submit')

    toast.add({ title: 'Success', description: `${message} `, color: 'success' })

    openModal.value = false

  } catch (error) {
    console.log(error)
    toast.add({ title: 'Success', description: `Error Submitting : ${error} `, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

const thumbnails = ref<{ filename: string, blob: Blob }[]>([])

const onChange = async () => {
  const shouldGenerateThumbnails = ['application/pdf']

  state.files?.forEach(file => {

    if (shouldGenerateThumbnails.includes(file.type)) {

      file.arrayBuffer().then(async (buff) => {

        const thumbnail = await generateThumbnail(new Uint8Array(buff))

        thumbnail?.toBlob(function (blob) {
          thumbnails.value.push({
            filename: getFilenameWithoutExtension(file.name),
            blob
          })
        }, 'image/png', 1)

      })

    }
  })
}


const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { files, ...data } = event.data

  const filenames = await upload(files)

  await submit({
    filenames,
    ...data
  })
}
</script>

<template>
  <UModal v-model:open="openModal" title="Tambah Dokumen" description="Tambah dokumen ke data lake">
    <UButton color="neutral" variant="ghost" square icon="i-lucide-plus" />

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">

        <UFormField>
          <UFileUpload v-model="state.files" icon="i-lucide-files" reset label="Drop your images here"
            @change="onChange" description="SVG, PNG, JPG or GIF (max. 2MB)" layout="list" multiple
            class="w-full min-h-48">

            <template #actions="{ open }">
              <UButton label="Select images" icon="i-lucide-upload" color="neutral" variant="outline" @click="open()" />
            </template>

            <template #files-top="{ open, files }">
              <div v-if="files?.length" class="mb-2 flex items-center justify-between">
                <p class="font-bold">Files ({{ files?.length }})</p>

                <UButton icon="i-lucide-plus" label="Add more" color="neutral" variant="outline" class="-my-2"
                  @click="open()" />
              </div>
            </template>

          </UFileUpload>
        </UFormField>


        <UFormField name="division_id" label="division"
          description="Your unique division for logging in and your profile URL." v-if="divisionsStatus === 'success'">
          <UCheckboxGroup indicator="hidden" size="sm" variant="card" :items="divisions" value-key="id" label-key="name"
            v-model="state.division_id" name="division_id" />

        </UFormField>

        <UFormField name="category_id" label="category"
          description="Your unique division for logging in and your profile URL." v-if="categoriesStatus === 'success'">
          <UCheckboxGroup indicator="hidden" size="sm" variant="card" :items="categories" value-key="id"
            label-key="name" v-model="state.category_id" name="category_id" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="openModal = false" />
          <UButton label="Create" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
