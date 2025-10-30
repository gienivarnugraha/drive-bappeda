<script setup lang="ts">
import type { Category, Division, Results } from '~/types'
import { toTitleCase } from '#imports'

const { isFileDetailsSlideoverOpen, isSidebarSlideOverOpen } = useDashboard()

const selectedCategory = ref<number[]>([])

const selectedDivision = ref<number[]>([])

const selected = ref<Results | null>(null)

const { data: documentData, pending: documentPending } = await useAsyncData<Results[]>('documents',
  () =>
    $fetch<Results[]>('/api/documents', {
      params: {
        category: selectedCategory.value.includes(0) ? [] : selectedCategory.value,
        division: selectedDivision.value.includes(0) ? [] : selectedDivision.value,
      }
    }
    ),
  {
    watch: [selectedCategory, selectedDivision],
  }
)

const { data: categories, pending: categoriesPending } = await useFetch<Category[]>('/api/categories', {
  transform: (data) => {
    data.unshift({ id: 0, name: 'Semua Kategori' })
    return data.map((category) => ({ id: category.id, name: toTitleCase(category.name) }))

  }
})

const { data: divisions, pending: divisionsPending } = await useFetch<Division[]>('/api/divisions', {
  transform: (data) => {
    data.unshift({ id: 0, name: 'Semua Bidang' })
    return data.map((division) => ({ id: division.id, name: toTitleCase(division.name) }))
  }
})


const selectDocument = (data: Results) => {
  isFileDetailsSlideoverOpen.value = true

  if (selected.value?.id === data.id) {
    selected.value = null
    return
  }

  selected.value = data
}

const contentWidth = computed(() => isFileDetailsSlideoverOpen.value || isSidebarSlideOverOpen.value)


</script>

<template>
  <div class="flex flex-row">
    <div class="flex flex-col gap-4">
      <div class="my-2">
        <div v-if="divisionsPending" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <USkeleton v-for="value in 4" class="h-8 w-full" />
        </div>

        <UCheckboxGroup v-else indicator="hidden" size="sm" variant="card" legend="Bidang" :items="divisions"
          value-key="id" label-key="name" orientation="horizontal" v-model="selectedDivision" :ui="{
            fieldset: 'flex flex-wrap gap-x-2',
          }
            " />

      </div>

      <div class="my-2 flex flex-wrap">
        <div v-if="categoriesPending" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <USkeleton v-for="value in 4" class="h-8 w-full" />
        </div>

        <UCheckboxGroup v-else indicator="hidden" size="sm" variant="card" legend="Kategori" :items="categories"
          value-key="id" label-key="name" orientation="horizontal" v-model="selectedCategory" />
      </div>


      <div class="flex flex-col gap-4">
        <p class="text-xs">Dokumen</p>
        <div v-if="documentPending" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <USkeleton v-for="value in 4" class="h-16 w-full" />
        </div>

        <div v-else class="grid"
          :class="[contentWidth ? 'grid-cols-1 sm:grid-cols-2 gap-4' : 'grid-cols-2 sm:grid-cols-4 gap-6']">
          <FileThumbnail v-for="(item, idx) in documentData" :key="item.id" :data="item"
            :is-selected="item.id === selected?.id" @click="selectDocument(item)" />
        </div>

      </div>


    </div>

    <FileDetailsSlideOver :document="selected" />

  </div>
</template>