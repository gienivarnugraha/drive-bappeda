<script setup lang="ts">
import type { Category, Division, FilteredData } from '~/types'
import { toTitleCase } from '#imports'

const { isFileDetailsSlideoverOpen } = useDashboard()

const selectedCategory = ref<number[]>([])

const selectedDivision = ref<number[]>([])

const selected = ref<FilteredData | null>(null)

const { data, status } = await useAsyncData<FilteredData[]>('documents',
  () =>
    $fetch<FilteredData[]>('/api/documents', {
      params: {
        category: selectedCategory.value,
        division: selectedDivision.value
      }
    }
    ),
  {
    watch: [selectedCategory, selectedDivision],
    immediate: false
  }
)

const { data: categories, status: categoriesStatus } = await useFetch<Category[]>('/api/categories', {
  transform: (data) => {
    data.unshift({ id: 0, name: 'Semua Kategori' })
    return data.map((category) => ({ id: category.id, name: toTitleCase(category.name) }))

  }
})

const { data: divisions, status: divisionsStatus } = await useFetch<Division[]>('/api/divisions', {
  transform: (data) => {
    data.unshift({ id: 0, name: 'Semua Bidang' })
    return data.map((division) => ({ id: division.id, name: toTitleCase(division.name) }))
  }
})


const selectDocument = (data: FilteredData) => {
  isFileDetailsSlideoverOpen.value = true
  selected.value = data
}

</script>

<template>
  <div class="flex flex-row">
    <div class="flex flex-col gap-4">
      <div class="my-2 flex flex-wrap" v-if="divisionsStatus === 'success'">
        <UCheckboxGroup indicator="hidden" size="sm" variant="card" legend="Bidang" :items="divisions" value-key="id"
          label-key="name" orientation="horizontal" v-model="selectedDivision" />

      </div>

      <div class="my-2 flex flex-wrap" v-if="categoriesStatus === 'success'">
        <UCheckboxGroup indicator="hidden" size="sm" variant="card" legend="Kategori" :items="categories" value-key="id"
          label-key="name" orientation="horizontal" v-model="selectedCategory" />
      </div>


      <div class="flex flex-col gap-4">
        <p class="text-xs">Dokumen</p>
        <div v-if="status === 'success'" class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
          <FileThumbnail v-for="item in data" :key="item.documents.id" :data="item"
            :is-selected="item.documents.id === selected?.documents.id" @click="selectDocument(item)" />
        </div>
        <div v-else> Tidak ada file </div>

      </div>


    </div>

    <FileDetailsSlideOver :document="selected?.documents" />

  </div>
</template>