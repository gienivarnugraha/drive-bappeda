<script setup lang="ts">
import type { Category, Division, Results } from '~/types'
import { toTitleCase } from '#imports'

const { categories, divisions } = await useItems()

const selectedCategory = ref<number[]>([])

const selectedDivision = ref<number[]>([])

const selected: Ref<Results | undefined> = ref(undefined)

const perPage: Ref<number> = ref(10)

const layoutView: Ref<'grid' | 'table'> = ref('grid')

const currentPage: Ref<number> = ref(1)

const { data: documentData, pending: documentPending, refresh } = await useLazyFetch<{ count: number, data: Results[] }>('/api/documents',
  {
    params: {
      category: selectedCategory.value.includes(0) ? [] : selectedCategory.value,
      division: selectedDivision.value.includes(0) ? [] : selectedDivision.value,
      perPage: perPage.value,
      page: currentPage.value,
    },
    watch: [selectedCategory, selectedDivision, perPage, currentPage],
  }
)


let availableDivisions: Ref<Division[]> = ref([])
let availableCategories: Ref<Category[]> = ref([])


onMounted(() => {
  if (availableCategories.value) {
    availableCategories.value = deepClone(categories.value)
    availableCategories.value.unshift({ id: 0, name: 'Semua Kategori' })
  }

  if (availableDivisions.value) {
    availableDivisions.value = deepClone(divisions.value)
    availableDivisions.value.unshift({ id: 0, name: 'Semua Bidang' })
  }
})

const documentUpdated = () => {
  refresh()
}


</script>

<template>
  <div class="flex flex-row">
    <div class="flex flex-col gap-4 ">
      <div class="my-2">

        <div v-if="divisions.length > 0">
          <UCheckboxGroup indicator="hidden" size="sm" variant="card" legend="Bidang" :items="availableDivisions"
            value-key="id" label-key="name" orientation="horizontal" v-model="selectedDivision"
            :ui="{ fieldset: 'flex flex-wrap gap-x-2' }" />

        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <USkeleton v-for="value in 6" class="h-8 w-full" />
        </div>
      </div>

      <div class="my-2 flex flex-wrap">

        <div v-if="categories.length > 0">
          <UCheckboxGroup indicator="hidden" size="sm" variant="card" legend="Kategori" :items="availableCategories"
            value-key="id" label-key="name" orientation="horizontal" v-model="selectedCategory"
            :ui="{ fieldset: 'flex flex-wrap gap-x-2' }" />

        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <USkeleton v-for="value in 6" class="h-8 w-full" />
        </div>
      </div>


      <div class="flex flex-col gap-4">
        <div class="flex flex-row justify-between items-center">
          <p class="text-xs">Ditemukan {{ documentData?.count }} Dokumen</p>
          <div class="flex flex-row space-x-2">
            <UInput icon="i-lucide-search" placeholder="Cari..." :trailing="false" />
            <UInputMenu v-model="perPage" :items="[10, 25, 50, 75]" />
          </div>
          <div class="flex flex-row space-x-2">
            <UButton icon="i-lucide-layout-grid" :variant="layoutView === 'grid' ? 'subtle' : 'ghost'"
              @click="layoutView = 'grid'" />
            <UButton icon="i-lucide-table-properties" :variant="layoutView === 'table' ? 'subtle' : 'ghost'"
              @click="layoutView = 'table'" />
          </div>
        </div>

        <div v-if="documentPending" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <USkeleton v-for="value in 6" class="h-24 w-full" />
        </div>

        <div v-else>
          <FileGridView v-if="layoutView === 'grid'" :document="documentData?.data" v-model="selected" />

          <FileTableView v-if="layoutView === 'table'" :document="documentData?.data" v-model="selected" />
        </div>

      </div>



      <div class="h-12 w-8 relative">
        <FileDetails v-if="selected" :document="selected" @update:document="documentUpdated" />
      </div>

    </div>
  </div>
</template>