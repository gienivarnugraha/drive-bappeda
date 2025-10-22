<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Category, Division } from '~/types'

const schema = z.object({
  category_id: z.array(z.number()),
  division_id: z.array(z.number()),
  file: z.array(z.string()),
})

const fileRef = ref<HTMLInputElement>()

const open = ref(false)

const isDragging = ref(false)

const filename = ref<string[]>([])

const addedFiles = computed(() => filename.value.join(','))

type Schema = z.output<typeof schema>


const { data: categories, status: categoriesStatus } = await useFetch<Category[]>('/api/categories')

const { data: divisions, status: divisionsStatus } = await useFetch<Division[]>('/api/divisions')

const state = reactive<Partial<Schema>>({
  file: undefined,
  category_id: undefined,
  division_id: undefined,
})

function processFile(files: File[]) {
  let filenames: string[] = []
  let fileurls: string[] = []

  files.forEach(file => {

    filenames.push(file.name)

    fileurls.push(URL.createObjectURL(file!))
  })

  filename.value = filenames
  state.file = fileurls
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  processFile(Array.from(input.files))

}

function onFileClick() {
  fileRef.value?.click()
}

function onDrop(e: DragEvent) {
  if (e.dataTransfer?.files.length) {
    processFile(Array.from(e.dataTransfer.files))
  }

  isDragging.value = false
}

function onDragOver(e: Event) {
  isDragging.value = true
}

function onDragLeave(e: Event) {
  isDragging.value = false
}


const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event.data)

  const formData = new FormData();

  for (const value of event.data.file) {
    console.log(value)
    //@ts-ignore
    formData.append('file', value);
  }

  //@ts-ignore
  formData.append('category_id', JSON.stringify(event.data.category_id));
  //@ts-ignore
  formData.append('division_id', JSON.stringify(event.data.division_id));

  try {
    const { message } = await $fetch('/api/documents', {
      method: 'post',
      body: formData
    })

    toast.add({ title: 'Success', description: `${message} `, color: 'success' })
  } catch (error) {
    console.log(error)
  }

  // toast.add({ title: 'Success', description: `New customer ${event.data.file} added`, color: 'success' })
  // open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Tambah Dokumen" description="Tambah dokumen ke data lake">
    <UButton color="neutral" variant="ghost" square icon="i-lucide-plus" />

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField name="file" label="Dokumen" :description="state.file ? addedFiles : 'Click or drop file here'"
          @drop.prevent="onDrop" class="flex max-sm:flex-col justify-between sm:items-center gap-4 py-2"
          @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
          :class="{ 'border-dashed border-2 border-gray-600 dark:border-gray-500 bg-gray-50/25 rounded-md': isDragging }">
          <div class="flex flex-wrap items-center gap-3">
            <UButton label="Choose" color="neutral" @click="onFileClick" />
            <input ref="fileRef" type="file" class="hidden" accept=".pdf," @change="onFileChange">
          </div>
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
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Create" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
