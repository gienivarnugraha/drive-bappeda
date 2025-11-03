<script setup lang="ts">
import type { Category } from '~/types'
import { z } from 'zod'
import { clampCharacters, toTitleCase } from '~/utils'

const { categories } = await useItems()

const toast = useToast()

const schema = z.object({
  name: z.string().min(2, 'Too short'),
  description: z.string().optional()
})
type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  name: '',
  description: ''
})

const addView = ref(false)

const submit = async (item: Schema, shouldDelete = false) => {

  const { data, message } = await $fetch<{ message: string, data: Category }>('/api/categories', {
    method: 'POST',
    body: {
      shouldDelete,
      ...item
    }
  })

  if (shouldDelete) {
    const index = categories.value.findIndex((category: Category) => category.id === data.id)

    if (index !== -1) {
      categories.value.splice(index, 1)
    }
  } else {
    categories.value.push(data)
  }

  toast.add({
    title: 'Success',
    description: message,
    icon: 'i-lucide-check',
    color: 'success'
  })
}
</script>

<template>
  <UPageCard title="Kategori" description="Rubah kategori" variant="subtle">
    <div class="flex flex-row space-y-1 flex-wrap ">
      <div v-for="category in categories" :key="category.id"
        class="flex flex-row items-center justify-between space-x-1 px-2 py-1">
        <UTooltip :text="category.name">
          <UBadge class="font-bold rounded-full">
            <p class="text-xs"> {{ clampCharacters(toTitleCase(category.name), 20) }}</p>
            <template #trailing>
              <UButton color="error" variant="ghost" size="sm" icon="i-lucide-trash" @click="submit(category, true)" />
            </template>
          </UBadge>
        </UTooltip>
      </div>
    </div>

    <UTooltip text="Tambah Kategori">
      <UButton variant="subtle" label="Tambah Kategori" color="primary" size="sm"
        :icon="addView ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" @click="addView = !addView" />
    </UTooltip>

    <UForm v-if="addView" :schema="schema" :state="state" class="flex flex-col gap-4 max-w-md " @submit="submit(state)">
      <UFormField name="name" label="Name" description="Nama Kategori"
        class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="state.name" placeholder="New Category Name" class="w-full" />
      </UFormField>

      <UFormField name="description" label="Description" description="Deskripsi Kategori"
        class="flex max-sm:flex-col justify-between items-start gap-4">
        <UTextarea v-model="state.description" :rows="2" placeholder="Description of category" class="w-full" />
      </UFormField>

      <UButton label="Add" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>
</template>
