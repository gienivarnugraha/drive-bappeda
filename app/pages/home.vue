<script setup lang="ts">
import type { Category, Division, Results } from '~/types'
import { toTitleCase, clampCharacters } from '#imports'

definePageMeta({
  layout: 'home',
  middleware: 'auth'
})

const { categories, divisions } = await useItems()

const selectedCategory = ref<number[]>([])

const selectedDivision = ref<number[]>([])

const selected: Ref<Results | undefined> = ref(undefined)

const perPage: Ref<number> = ref(10)

const layoutView: Ref<'grid' | 'table'> = ref('grid')

const page: Ref<number> = ref(1)

const count: Ref<number> = ref(0)

// const documentData: Ref<Results[]> = ref([])

callOnce(async () => {
  const response = await $fetch<number>('/api/count')

  if (response) {
    count.value = response
  }
})

const { data: documentData, pending: documentPending, execute } = await useAsyncData<{ data: Results[] }>('documents', () =>
  $fetch<{ data: Results[] }>('/api/documents',
    {
      query: {
        perPage: perPage.value,
        page: page.value,
        category: selectedCategory.value,
        division: selectedDivision.value
      }
    }),
  {
    watch: [selectedCategory, selectedDivision, perPage, page]
  }
)

const availableDivisions: Ref<Division[]> = ref([])
const availableCategories: Ref<Category[]> = ref([])

const showMoreCategories: Ref<boolean> = ref(false)

const showAvailableCategories: ComputedRef<Category[]> = computed(() => showMoreCategories.value ? availableCategories.value : availableCategories.value.slice(0, 5))

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

const documentUpdated = async () => {
  await execute()
}
</script>

<template>
  <div class="flex flex-row">
    <div class="flex flex-col gap-4 ">
      <div class="my-2">
        <div v-if="divisions.length > 0">
          <UCheckboxGroup v-model="selectedDivision" indicator="hidden" size="xs" variant="card" legend="Bidang"
            :items="availableDivisions" value-key="id" label-key="name" orientation="horizontal"
            :ui="{ fieldset: 'flex flex-wrap space-x-2 space-y-2' }">
            <template #label="{ item }">
              <UTooltip :text="item.name">
                <span class="text-xs">{{ clampCharacters(toTitleCase(item.name), 15) }}</span>
              </UTooltip>
            </template>
          </UCheckboxGroup>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <USkeleton v-for="value in 6" class="h-8 w-full" />
        </div>
      </div>

      <div class="my-2 flex flex-wrap">
        <div v-if="categories.length > 0" class="flex flex-col space-y-2">
          <UTooltip text="Tampilkan Semua Kategori">
            <UButton variant="subtle" label="Tampilkan Semua Kategori" color="primary" size="xs"
              :icon="showMoreCategories ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              @click="showMoreCategories = !showMoreCategories" />
          </UTooltip>

          <UCheckboxGroup v-model="selectedCategory" indicator="hidden" size="xs" variant="card" legend="Kategori"
            :items="showAvailableCategories" value-key="id" label-key="name" orientation="horizontal"
            :ui="{ fieldset: 'flex flex-wrap space-x-2 space-y-2' }">
            <template #label="{ item }">
              <UTooltip :text="item.name">
                <span class="text-xs">{{ clampCharacters(toTitleCase(item.name), 15) }}</span>
              </UTooltip>
            </template>

          </UCheckboxGroup>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <USkeleton v-for="value in 6" class="h-8 w-full" />
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-row justify-between items-center">
          <div class="flex flex-row space-x-2">
            <!-- <UInput icon="i-lucide-search" placeholder="Cari..." :trailing="false" /> -->
            <UPagination v-model:page="page" :total="count" />
            <UInputMenu v-model="perPage" class="max-w-16" :items="[10, 25, 50, 75]" label="Per halaman" />
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
          <FileGridView v-if="layoutView === 'grid'" v-model="selected" :document="documentData?.data" />

          <FileTableView v-if="layoutView === 'table'" v-model="selected" :document="documentData?.data" />
        </div>

        <p class="text-xs">
          Ditemukan {{ count }} Dokumen
        </p>
      </div>

      <div class="h-12 w-8 relative">
        <FileDetails v-if="selected" :document="selected" @update:document="documentUpdated" />
      </div>
    </div>
  </div>
</template>
