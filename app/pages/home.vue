<script setup lang="ts">
import type { Category, Division, Results } from '#shared/types'
import { deepClone, clampCharacters } from '#shared/utils'
import type { SelectItem } from '#ui/types'
import { useTailwindBreakpoints } from '~/composables/useTailwindBreakpoints'

definePageMeta({
  layout: 'home',
  auth:true
})

const { categories, divisions } = await useItems()

const { smAndLarger } = useTailwindBreakpoints()

const selectedCategory = ref<number[]>([])

const selectedDivision = ref<number[]>([])

const selected: Ref<Results> = ref({} as Results)

const perPage: Ref<number> = ref(3)

const layoutView: Ref<'grid' | 'table'> = ref('grid')

const page: Ref<number> = ref(1)

const orderOptions: Ref<SelectItem[]> = ref([
  { label: 'ID', value: 'id' },
  { label: 'Tanggal', value: 'created_at' },
  { label: 'Nama File', value: 'filename' },
  { label: 'Judul', value: 'title' },
])

const orderBy = ref('id')

const orderDir: Ref<'asc' | 'desc'> = ref('desc')

// const documentData: Ref<Results[]> = ref([])

const { data: count, execute: countExecute } = await useLazyAsyncData<number>('count', () => $fetch<number>('/api/count'), {
  immediate: true
})

const { data: documentData, pending: documentPending, execute } = await useAsyncData<Results[]>('documents', () =>
  $fetch<Results[]>('/api/documents', {
    query: {
      perPage: perPage.value,
      page: page.value,
      category: selectedCategory.value,
      division: selectedDivision.value,
      orderBy: orderBy.value,
      orderDir: orderDir.value
    },
  }),
  {
    watch: [perPage, page, selectedCategory, selectedDivision, orderBy, orderDir],
    immediate: true

  }
)

const availableDivisions: Ref<Division[]> = ref([])
const availableCategories: Ref<Category[]> = ref([])

const showMoreCategories: Ref<boolean> = ref(false)

const showAvailableCategories: ComputedRef<Category[]> = computed(() => showMoreCategories.value ? availableCategories.value : availableCategories.value.slice(0, 5))

onMounted(() => {
  if (categories.value) {
    availableCategories.value = deepClone(categories.value)
    availableCategories.value.unshift({ id: 0, name: 'Semua Kategori' })
  }

  if (divisions.value) {
    availableDivisions.value = deepClone(divisions.value)
    availableDivisions.value.unshift({ id: 0, name: 'Semua Bidang' })
  }
})

const documentUpdated = async () => {
  await execute()
  await countExecute()
}
</script>

<template>
  <div class="flex flex-row">
    <div class="flex flex-col gap-4 ">
      <ClientOnly>
        <div class="my-2">
          <UCheckboxGroup v-model="selectedDivision" indicator="hidden" size="xs" variant="card" legend="Bidang"
            :items="availableDivisions" value-key="id" label-key="name" orientation="horizontal"
            :ui="{ fieldset: 'flex flex-wrap space-x-2 space-y-2' }">
            <template #label="{ item }">
              <UTooltip :text="item.metadata?.display_name || item.name">
                <span class="text-xs">{{ clampCharacters(item.metadata?.display_name || item.name, 15) }}</span>
              </UTooltip>
            </template>
          </UCheckboxGroup>

        </div>
        <template #fallback>
          <div class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
            <USkeleton v-for="value in 8" class="h-16 w-full" />
          </div>
        </template>
      </ClientOnly>

      <USeparator class="h-2" />

      <UTooltip text="Tampilkan Semua Kategori">
        <UButton variant="subtle" :label="`Tampilkan Semua Kategori (${categories.length})`" color="primary" size="xs"
          class="max-w-fit" :icon="showMoreCategories ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          @click="showMoreCategories = !showMoreCategories" />
      </UTooltip>

      <ClientOnly>
        <div class="my-2 flex flex-wrap">
          <UCheckboxGroup v-model="selectedCategory" indicator="hidden" size="xs" variant="card" legend="Kategori"
            :items="showAvailableCategories" value-key="id" label-key="name" orientation="horizontal"
            :ui="{ fieldset: 'flex flex-wrap space-x-2 space-y-2' }">
            <template #label="{ item }">
              <UTooltip :text="item.metadata?.display_name || item.name">
                <span class="text-xs">{{ clampCharacters(item.metadata?.display_name || item.name, 15) }}</span>
              </UTooltip>
            </template>

          </UCheckboxGroup>

        </div>

        <template #fallback>
          <div class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
            <USkeleton v-for="value in 8" class="h-16 w-full" />
          </div>
        </template>
      </ClientOnly>

      <USeparator class="h-2" />

      <div class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row justify-between space-y-2 items-center ">
          <div class="flex flex-row space-x-4 items-center">
            <UPagination v-model:page="page" :total="count" :sibling-count="0" :items-per-page="perPage" />
          </div>

          <USeparator orientation="vertical" class="hidden sm:visible h-4" color="primary" type="solid" />

          <div class="flex flex-row space-x-2 items-center">
            <!-- <UInput icon="i-lucide-search" placeholder="Cari..." :trailing="false" /> -->

            <p class="hidden sm:visible text-xs">Per Halaman</p>
            <USelect v-model="perPage" class="max-w-16" :items="[3, 10, 25, 50, 75]" label="Per halaman" />

            <USeparator orientation="vertical" class="h-4" color="primary" type="solid" />

            <p class="hidden sm:visible text-xs">Urutkan</p>
            <UFieldGroup>
              <USelect v-model="orderBy" :items="orderOptions" :ui="{ content: 'min-w-fit' }" />
              <UButton :icon="orderDir === 'asc' ? 'i-lucide-arrow-up-a-z' : 'i-lucide-arrow-down-z-a'"
                @click="orderDir = orderDir === 'asc' ? 'desc' : 'asc'"></UButton>

            </UFieldGroup>
          </div>

          <USeparator orientation="vertical" class="hidden sm:visible h-4" color="primary" type="solid" />

          <div class="flex flex-row space-x-2 items-center">
            <UButton icon="i-lucide-layout-grid" :variant="layoutView === 'grid' ? 'subtle' : 'ghost'"
              @click="layoutView = 'grid'" />
            <USeparator orientation="vertical" class="h-4" color="primary" type="solid" />

            <UButton icon="i-lucide-table-properties" :variant="layoutView === 'table' ? 'subtle' : 'ghost'"
              @click="layoutView = 'table'" />
          </div>
        </div>

        <div v-if="documentPending" class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4">
          <USkeleton v-for="value in 6" class="h-36 w-full" />
        </div>

        <div v-else>
          <FileGridView v-if="layoutView === 'grid' && documentData" v-model="selected" :document="documentData" />

          <FileTableView v-if="layoutView === 'table' && documentData" v-model="selected" :document="documentData" />
        </div>

        <p class="text-xs">
          Menampilkan {{ documentData?.length }} dari {{ count }} dokumen
        </p>
      </div>

      <div class="h-12 w-8 relative">
        <FileDetails v-if="selected" :document="selected" @update:document="documentUpdated" />
      </div>
    </div>
  </div>
</template>
