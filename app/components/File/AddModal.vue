<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, StepperItem } from '@nuxt/ui'
import type { Category, Division } from '#shared/types'
import { sanitizeFileName, getFileExtension } from '#shared/utils'
import { generateThumbnail } from '~/utils/pdf'
import { v4 as uuid } from 'uuid'

import { useItems } from '~/composables/useItems'

const addModalOpen: Ref<boolean> = ref(false)

const { divisions: availableDivisions, categories: availableCategories } = await useItems()

const fileUploading = ref(false)

const disabled = ref(false)

const isSubmitting = ref(false)

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

const allSuccess = computed(() => state.files?.length === successCount.value)


async function upload(files: File[]) {
  fileUploading.value = true

  const formData = new FormData()

  files.forEach((file, index) => {
    formData.append('file', file, `${sanitizeFileName(file.name)}.${getFileExtension(file.name)}`)

    if (thumbnails.value.length > 0) {
      formData.append('thumbnail', thumbnails.value[index].blob, `${sanitizeFileName(file.name)}.png`)
    }

  })

  try {
    const { message, filenames } = await $fetch('/api/upload', {
      method: 'post',
      body: formData
    })

    return filenames
  } catch (error: any) {
    console.log(error)
    toast.add({ title: 'Error', description: `${error.statusMessage}`, color: 'error' })
  } finally {
    fileUploading.value = false
  }
}

async function submit(data: Omit<Schema, 'files'> & { filenames: string[] | undefined }) {
  isSubmitting.value = true

  try {
    const response = await $fetch('/api/documents', {
      method: 'post',
      body: data
    })

    toast.add({ title: 'Success', description: `Sucess adding file to datalake `, color: 'success' })
  } catch (error) {
    console.log(error)
  } finally {
    isSubmitting.value = false
  }
}

const onChange = () => {
  const shouldGenerateThumbnails = ['application/pdf']

  state.files?.forEach((file) => {
    if (shouldGenerateThumbnails.includes(file.type)) {
      file.arrayBuffer().then(async (buff) => {
        // const thumbnail = await generateThumbnail(new Uint8Array(buff))
        const thumbnail = await generateThumbnail(new Uint8Array(buff))

        thumbnail?.toBlob(function (blob) {
          thumbnails.value.push({
            filename: sanitizeFileName(file.name),
            // @ts-ignore
            blob
          })

          console.log('thumbnails:', thumbnails.value.length)

        }, 'image/png', 1)
      })
    }

  })
}

let eventSource: EventSource | null = null

const isEventSourceClosed = computed(() => eventSource?.readyState !== 2)
// onUnmounted(() => {
//   if (eventSource) {
//     eventSource.close()
//   }
//   isProcessing.value = false
// })

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

const processSteps: Ref<{ message: string, status: string }[]> = ref([])

const processStepsStyle = (index: number, data: any) => {
  if (index === processSteps.value.length - 1 && data.status === 'info') {
    return {
      icon: 'i-lucide-loader',
      class: 'animate-spin'
    }
  }

  if (data.status === 'error') {
    return {
      icon: 'i-lucide-circle-x',
      class: 'text-error'
    }
  }

  if (data.status === 'success') {
    return {
      icon: 'i-lucide-circle-check',
      class: 'text-primary'
    }
  }

  return {
    icon: 'i-lucide-info',
    class: 'text-primary'
  }
}
const stepActive = ref(0)

const stream = async () => {
  eventSource = new EventSource('/api/push-notif')

  // Listen for messages from the server
  eventSource.onmessage = function (event) {
    const data = JSON.parse(event.data)

    if (data.status === 'success') {
      successCount.value += 1

      if (allSuccess.value) {

        if (eventSource) {
          eventSource.close()
        }

        stepActive.value = 2

        console.log(data.status, stepActive.value)


        addModalOpen.value = false

      }
    }

    stepActive.value = 1

    if (!processSteps.value.includes(data)) {
      processSteps.value.push(data)
    }
  }

  // Log connection error
  eventSource.onerror = function (event) {
    isProcessing.value = false

    if (eventSource) {
      eventSource.close()
    }

    toast.add({ title: 'Error', description: `${event} `, color: 'error' })
  }
}

const backFromProcess = () => {
  isProcessing.value = false
  stepActive.value = 0
  processSteps.value = []
}

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { files, ...data } = event.data

  isProcessing.value = true

  await stream()

  const filenames = await upload(files)

  if (filenames && filenames.length > 0) {
    await submit({
      filenames,
      ...data
    })
  }

  return
}
</script>

<template>
  <UModal v-model:open="addModalOpen" title="Tambah Dokumen" description="Tambah dokumen ke data lake">
    <UButton color="neutral" variant="ghost" square icon="i-lucide-plus" />

    <template #body>
      <div v-if="isEventSourceClosed" class="flex mb-4 justify-between items-center">
        <p> Progress </p>

        <UButton icon="i-lucide-arrow-left" label="Back" @click="backFromProcess" />
      </div>

      <UStepper v-if="isProcessing" v-model="stepActive" disabled orientation="vertical" :items="stepperItems"
        class="w-full">
        <template #process>
          <div class="w-full h-48 flex flex-col items-center justify-start pb-4">
            <div v-for="(step, index) in processSteps" :key="index"
              class="my-4 w-full flex flex-row items-center justify-start space-x-4">
              <UIcon :name="processStepsStyle(index, step).icon" :class="processStepsStyle(index, step).class"
                class="h-4 w-4 flex-none" color=" primary" />
              <p :class="index === processSteps.length - 1 ? 'font-bold' : 'text-slate-500'"
                class="flex-1 text-left text-xs">
                {{ step.message }}
              </p>
            </div>
          </div>
        </template>
      </UStepper>

      <UForm v-else :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField>
          <UFileUpload v-model="state.files" icon="i-lucide-files" reset label="Drop file anda disini"
            description="PDF, Word files" layout="list" multiple class="w-full min-h-48" @change="onChange">

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

        <UFormField name="divisions" label="Bidang"
          description="Your unique division for logging in and your profile URL.">
          <UCheckboxGroup v-if="availableDivisions" v-model="state.divisions" indicator="hidden" size="sm"
            variant="card" :items="availableDivisions" value-key="id" label-key="name" name="divisions"
            :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }" />

          <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <USkeleton v-for="value in 4" class="h-8 w-full" />
          </div>
        </UFormField>

        <UFormField name="categories" label="Kategori"
          description="Your unique division for logging in and your profile URL.">
          <UCheckboxGroup v-if="availableCategories" v-model="state.categories" indicator="hidden" size="sm"
            variant="card" :items="availableCategories" value-key="id" label-key="name" name="categories"
            :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }" />

          <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <USkeleton v-for="value in 4" class="h-8 w-full" />
          </div>
        </UFormField>

        <p v-if="disabled" class="text-xs text-slate-500">generating thumbnails...</p>
        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="addModalOpen = false" />
          <UButton label="Create" color="primary" variant="solid" type="submit" :disabled="disabled" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
