<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Category, Division } from '~/types'
import { getFilenameWithoutExtension, getFileExtension } from '~/utils/index';
import { generateThumbnail } from '~/utils/pdf';
import { v4 as uuid } from 'uuid'


const addModalOpen: Ref<boolean> = ref(false)

const { data: categories, pending: categoriesPending } = await useFetch<Category[]>('/api/categories')

const { data: divisions, pending: divisionsPending } = await useFetch<Division[]>('/api/divisions')

const fileUploading = ref(false)

const isSubmitting = ref(false)

const isProcessing = ref(false)

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
    formData.append('file', file);

    if (thumbnails.value) {
      // @ts-ignore
      formData.append('thumbnail', thumbnails.value[index].blob, `${thumbnails.value[index].filename}.png`);
    }
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
    const response = await $fetch('/api/documents', {
      method: 'post',
      body: data,
    })

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

        // const thumbnail = await generateThumbnail(new Uint8Array(buff))
        const thumbnail = await generateThumbnail(new Uint8Array(buff))

        thumbnail?.toBlob(function (blob) {
          thumbnails.value.push({
            filename: getFilenameWithoutExtension(file.name),
            //@ts-ignore
            blob
          })
        }, 'image/png', 1)

      })

    }
  })

}

let eventSource: EventSource | null = null

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
  isProcessing.value = false
})



import type { StepperItem } from '@nuxt/ui'

const stepperItems = ref<StepperItem[]>([
  {
    slot: 'upload' as const,
    title: 'Upload',
    description: 'Uploading your files',
    icon: 'i-lucide-upload'
  },
  {
    slot: 'process' as const,
    title: 'Process',
    description: 'Processing your files',
    icon: 'i-lucide-truck'
  },
  {
    slot: 'done' as const,
    title: 'Done',
    description: 'Use chatbot to ask questions about your documents',
    icon: 'i-lucide-check'
  }
])

const processSteps: Ref<string[]> = ref([])

const processStepsStyle = (index: number, data: any) => {
  if (index === processSteps.value.length - 1) {
    return {
      icon: 'i-lucide-loader',
      class: 'animate-spin'
    }
  }

  if (data.status === 'error') {
    return {
      icon: 'i-lucide-x',
      class: 'text-error'
    }
  }

  return {
    icon: 'i-lucide-check',
    class: 'text-primary'
  }
}
const stepActive = ref(0)

const stream = async () => {

  eventSource = new EventSource('api/push-notif');

  // Listen for messages from the server
  eventSource.onmessage = function (event) {
    let data = JSON.parse(event.data)

    if (data.status === 'success') {
      if (eventSource) {
        eventSource.close()
      }

      stepActive.value = 2
    }

    stepActive.value = 1

    if (!processSteps.value.includes(data)) {
      processSteps.value.push(data)
    }
  };

  // Log connection error
  eventSource.onerror = function (event) {
    isProcessing.value = false

    if (eventSource) {
      eventSource.close()
    }

    toast.add({ title: 'Error', description: `${event} `, color: 'error' })
  };

}


const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { files, ...data } = event.data

  isProcessing.value = true

  await stream()

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

    <UButton color="neutral" variant="ghost" square icon="i-lucide-plus" />

    <template #body>

      <UStepper v-if="isProcessing" disabled orientation="vertical" :items="stepperItems" v-model="stepActive"
        class="w-full">


        <template #process>
          <div class="w-full h-48 flex flex-col items-center justify-start">
            <div class="my-4 w-full flex flex-row items-center justify-start space-x-4"
              v-for="(step, index) in processSteps" :key="index">
              <UIcon :name="processStepsStyle(index, step).icon" :class="processStepsStyle(index, step).class"
                class="h-8 w-8 flex-none" color=" primary" />
              <p :class="index === processSteps.length - 1 ? 'font-bold' : 'text-slate-500'"
                class="flex-1 text-left text-xs">{{ step }}</p>
            </div>
          </div>
        </template>

      </UStepper>


      <UForm v-else :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">

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
          <div v-if="divisionsPending" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <USkeleton v-for="value in 4" class="h-8 w-full" />
          </div>

          <UCheckboxGroup v-else indicator="hidden" size="sm" variant="card" :items="divisions" value-key="id"
            label-key="name" v-model="state.division_id" name="division_id" />
        </UFormField>

        <UFormField name="category_id" label="category"
          description="Your unique division for logging in and your profile URL.">
          <div v-if="categoriesPending" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <USkeleton v-for="value in 4" class="h-8 w-full" />
          </div>

          <UCheckboxGroup v-else indicator="hidden" size="sm" variant="card" :items="categories" value-key="id"
            label-key="name" v-model="state.category_id" name="category_id" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="addModalOpen = false" />
          <UButton label="Create" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
