<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist';
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Category, Division } from '~/types'
import { getFilenameWithoutExtension, getFileExtension } from '../../utils/index';
import { v4 as uuid } from 'uuid'


const { addModalOpen } = useDashboard()

const { data: categories, status: categoriesStatus } = await useFetch<Category[]>('/api/categories')

const { data: divisions, status: divisionsStatus } = await useFetch<Division[]>('/api/divisions')

const fileUploading = ref(false)

const isSubmitting = ref(false)

const schema = z.object({
  files: z.instanceof(File).array(),
  category_id: z.number().array(),
  division_id: z.number().array(),
})

const thumbnails: Ref<{ filename: string, blob: Blob }[]> = ref([])

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  files: undefined,
  category_id: undefined,
  division_id: undefined,
})

let ids: string[] = []

async function upload(files: File[]) {
  fileUploading.value = true

  const formData = new FormData();

  ids = files.map((_) => uuid())

  files.forEach((file, index) => {
    let extension = getFileExtension(file.name)
    let filename = getFilenameWithoutExtension(file.name)

    formData.append('file', file, `${filename}_${ids[index]}.${extension}`);

    // @ts-ignore
    formData.append('thumbnail', thumbnails.value[index].blob, `${thumbnails.value[index].filename}_${ids[index]}.png`);
  })

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
    const response = await $fetch<ReadableStream>('/api/documents', {
      method: 'post',
      body: data,
    })

    console.log('submit')

    // addModalOpen.value = false

  } catch (error) {
    console.log(error)
    toast.add({ title: 'Success', description: `Error Submitting : ${error} `, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

const onChange = () => {
  const shouldGenerateThumbnails = ['application/pdf']

  state.files?.forEach(file => {

    if (shouldGenerateThumbnails.includes(file.type)) {


      file.arrayBuffer().then(async (buff) => {

        const thumbnail = await generateThumbnail(new Uint8Array(buff))

        thumbnail?.toBlob(function (blob) {
          thumbnails.value.push({
            filename: getFilenameWithoutExtension(file.name),
            // @ts-ignore
            blob
          })
        }, 'image/png', 1)

      })

    }
  })

}

let worker: pdfjsLib.PDFWorker | undefined = undefined

onMounted(() => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  worker = new pdfjsLib.PDFWorker()
})

const generateThumbnail = async (data: Uint8Array) => {
  try {

    let load = pdfjsLib.getDocument({ data, worker })

    let pdf = await load.promise

    const page = await pdf.getPage(1)

    let viewport = page.getViewport({ scale: 1 })

    const canvas = document.createElement("canvas");

    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // @ts-ignore
    await page.render({ canvasContext: context, viewport: viewport }).promise

    return canvas

  } catch (error) {
    console.error(error)
  }
}

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { files, ...data } = event.data

  const response = await $fetch<ReadableStream>('/api/push-notif', {
    responseType: 'stream',
  })

  console.log('streaming')

  const reader = response.pipeThrough(new TextDecoderStream()).getReader()

  // Read the chunk of data as we get it
  while (true) {
    const { value, done } = await reader.read()

    if (done) { break }

    toast.add({ title: 'Success', description: `${value} `, color: 'success' })
  }

  const filenames = await upload(files)

  if (!filenames) {
    toast.add({ title: 'Error', description: `File upload failed`, color: 'error' })
    return
  } else {
    await submit({
      filenames,
      ...data
    })
  }

}
</script>

<template>
  <UModal v-model:open="addModalOpen" title="Tambah Dokumen" description="Tambah dokumen ke data lake">

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
          description="Your unique division for logging in and your profile URL.">
          <UCheckboxGroup indicator="hidden" size="sm" variant="card" :items="divisions"
            :loading="divisionsStatus === 'pending'" value-key="id" label-key="name" v-model="state.division_id"
            name="division_id" />
        </UFormField>

        <UFormField name="category_id" label="category"
          description="Your unique division for logging in and your profile URL.">
          <UCheckboxGroup indicator="hidden" size="sm" variant="card" :items="categories"
            :loading="categoriesStatus === 'pending'" value-key="id" label-key="name" v-model="state.category_id"
            name="category_id" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="addModalOpen = false" />
          <UButton label="Create" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
