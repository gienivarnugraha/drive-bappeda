<script setup lang="ts">
import { formatBytes } from '#imports';
import type { Document as DocumentTypes } from '~/types';
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const { smallerThanLg } = useTailwindBreakpoints()

const { isFileDetailsSlideoverOpen } = useDashboard()


const props = defineProps<{
  document: DocumentTypes
}>()

onMounted(() => {
  if (props.document) {
    state.document = props.document
    state.categories = props.document.categories.map((category: any) => category.id)
    state.divisions = props.document.divisions.map((division: any) => division.id)
  }
})


const isSubmitting: Ref<boolean> = ref(false)
const toast = useToast()

const schema = z.object({
  document: z.custom<DocumentTypes>(),
  categories: z.number().array(),
  divisions: z.number().array(),
  shouldEdit: z.boolean().optional(),
  shouldDelete: z.boolean().optional(),
})


type Schema = z.infer<typeof schema>

let state = reactive<Partial<Schema>>({
  document: undefined,
  categories: undefined,
  divisions: undefined,
  shouldEdit: false,
  shouldDelete: false,
})

const onEdit = () => {
  state.shouldEdit = !state.shouldEdit
}

const edit = computed(() => state.shouldEdit)

onMounted(() => {
  state.document = props.document
})

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  isSubmitting.value = true

  try {
    const { message } = await $fetch<{ message: string }>('/api/documents', {
      method: 'post',
      body: toRaw(state),
    })


    toast.add({ title: 'Success', description: `${message} `, color: 'success' })

  } catch (error) {
    console.log(error)
  } finally {
    isSubmitting.value = false
    isFileDetailsSlideoverOpen.value = false
  }
}

const onDelete = async () => {
  isSubmitting.value = true

  try {
    const { message } = await $fetch<{ message: string }>('/api/documents', {
      method: 'post',
      body: {
        document: props.document,
        shouldDelete: true
      },
    })
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
  <UDrawer inset :direction="smallerThanLg ? 'bottom' : 'right'" :dismissible="false" :handle="false" :overlay="false"
    :modal="false" v-model:open="isFileDetailsSlideoverOpen" title="File Details" description="File description"
    :ui="{ header: 'flex justify-between items-center' }">

    <UTooltip text="Tutup Panel Detail Berkas">
      <UButton color="neutral" variant="solid" class="fixed bottom-10 right-10"
        :icon="isFileDetailsSlideoverOpen ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'"
        label="Open File" :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
        }" />
    </UTooltip>

    <template #header>
      <p class="text-highlighted max-w-full sm:max-w-60 font-semibold">{{ toTitleCase(document.title) }}
      </p>

      <div class="flex justify-between items-center space-x-1">
        <UButton color="neutral" variant="ghost" :icon="edit ? 'i-lucide-check' : 'i-lucide-pencil'" @click="onEdit" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isFileDetailsSlideoverOpen = false" />

      </div>
    </template>

    <template #body>
      <div class="flex flex-col px-2 overflow-y-auto max-w-full max-h-40 sm:max-h-full sm:max-w-84">
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">

          <img :src="`/documents/${document.metadata.thumbnailSrc}`"
            class="w-full sm:w-60 h-48 sm:h-32 object-cover rounded" alt="File Thumbnail" />

          <UFormField v-if="edit" label="Judul File" name="title">
            <UInput v-model="document.title" />
          </UFormField>

          <!-- <UFormField v-if="edit" label="Ringkasan" name="summary">
            <UTextarea class="w-full" v-model="document.metadata.summary" :rows="4" />
          </UFormField> -->
          <!-- <p v-else class="line-clamp-4 text-md"> {{ document.metadata.summary }}</p> -->
          <p v-if="!edit" class="line-clamp-4 text-md"> {{ document.metadata.summary }}</p>

          <FormDivision :edit="edit" v-model="state.divisions" />

          <FormCategory :edit="edit" v-model="state.categories" />


          <div class="flex justify-between items-center pt-4" v-if="edit">
            <UButton label="Hapus File" color="error" icon="i-lucide-save" @click="onDelete" />
            <UButton label="Simpan Perubahan" icon="i-lucide-save" type="submit" />
          </div>

          <ul v-else class="flex flex-col space-y-1">
            <li class="text-xs"><strong>Nama File:</strong></li>
            <li> {{ document.metadata.filename }} </li>
            <li class="text-xs"><strong>Ukuran File:</strong></li>
            <li> {{ formatBytes(document.metadata.filesize || 0) }} </li>
            <li class="text-xs"><strong>Tipe File:</strong></li>
            <li> {{ document.metadata.extension }} </li>
            <li class="text-xs"><strong>Tanggal Unggah:</strong></li>
            <li> {{ dateToLocale(document.metadata.createdAt) }} </li>
          </ul>
        </UForm>

      </div>
    </template>
  </UDrawer>

</template>
