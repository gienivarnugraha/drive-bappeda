<script setup lang="ts">
import type { Category, Division, Results } from '~/types'
import type { TableColumn, DropdownMenuItem, TableRow } from '@nuxt/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h, resolveComponent } from 'vue'

const UBadge = resolveComponent('UBadge')

const props = defineProps({
  document: {
    type: Object as PropType<Results[] | undefined>,
    required: true
  }
})

const emits = defineEmits(['update:modelValue'])

const columns: TableColumn<Results>[] = [
  {
    accessorKey: 'filename',
    header: 'Nama',
  },
  { accessorKey: 'description', header: 'Deskripsi' },
  { accessorKey: 'title', header: 'Judul' },
  { accessorKey: 'categories', header: 'Kategori' },
  { accessorKey: 'divisions', header: 'Bidang' },
  {
    accessorKey: 'metadata',
    header: 'Ukuran',
    cell: ({ row }) => {
      return formatBytes(row.original.metadata.fileSize || 0)
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Tanggal Upload',
    cell: ({ row }) => {
      return new Date(row.getValue('created_at')).toLocaleString('id-ID')
    }
  },
]


const state: Ref<Results[]> = ref([])


function getDropdownActions(document: Results): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-lucide-edit'
      },
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        color: 'error'
      }
    ]
  ]
}

/**
 * Calls splitItems once and returns the processed data object for a given row field.
 * @param row The table row object.
 * @param key The key to extract ('categories' or 'divisions').
 * @returns The split data object { shouldSplit, restItems, beginningItems }.
 */
const getSplitData = (row: any, key: 'categories' | 'divisions') => {
  // We call row.getValue() only once here
  const items = row.getValue(key);
  // We call splitItems() only once here
  return splitItems(items);
};

/**
 * Splits an array of items into two parts: the first 3 items (or all of them)
 * and the remaining items, also indicating if the total count exceeded 3.
 *
 * @param items The array of Category or Division objects.
 * @returns An object containing the split parts and a boolean flag.
 */
const splitItems = (items: Category[] | Division[], limit: number = 1) => {
  // Determine if the array has more than 3 items
  const shouldSplit = items.length > limit;

  // Get the first limit items, or all items if there are limit or less
  const beginningItems = shouldSplit ? items.slice(0, limit) : items;

  // Get the remaining items (starting from index limit)
  const restItems = items.slice(limit);

  return { shouldSplit, restItems, beginningItems };
};

function onSelect(e: Event, row: TableRow<Results>) {
  emits('update:modelValue', row.original as Results)
}


onMounted(() => {
  if (props.document) {
    state.value = props.document
  }
})
</script>

<template>
  <div class="grid grid-cols-1">
    <UTable :data="state" :columns="columns" @select="onSelect" :ui="{
      separator: 'divide-y divide-gray-200 dark:divide-gray-800'
    }" :empty-state="{ icon: 'i-lucide-file-text', label: 'No files.' }">

      <template #title-cell="{ row }">
        <UTooltip :text="row.getValue('title')">
          <span>
            {{ clampCharacters(toTitleCase(row.getValue('title')), 25) }}
          </span>
        </UTooltip>
      </template>

      <template #categories-cell="{ row }">
        <div class="flex items-center gap-3">
          <UBadge v-for="item in getSplitData(row, 'categories').beginningItems" :key="item.id" color="primary"
            variant="outline">
            <UTooltip :text="item.name">
              <span class="text-xs">
                {{ clampCharacters(toTitleCase(item.name), 10) }}
              </span>
            </UTooltip>
          </UBadge>

          <UPopover arrow>
            <UButton v-if="getSplitData(row, 'categories').shouldSplit"
              :label="`+  ${getSplitData(row, 'categories').restItems.length}`" variant="ghost" />

            <template #content>
              <div class="flex flex-wrap gap-2 max-w-sm bg-gray-200 dark:bg-gray-800 rounded-md p-2">
                <UBadge v-for="restItem in getSplitData(row, 'categories').restItems" :key="restItem.id" color="primary"
                  variant="outline" :label="toTitleCase(restItem.name)">
                </UBadge>

              </div>
            </template>
          </UPopover>

        </div>
      </template>

      <template #divisions-cell="{ row }">
        <div class="flex items-center gap-3">
          <UBadge v-for="item in getSplitData(row, 'divisions').beginningItems" :key="item.id" color="primary"
            variant="outline">
            <UTooltip :text="item.name">
              <span class="text-xs">
                {{ clampCharacters(toTitleCase(item.name), 10) }}
              </span>
            </UTooltip>
          </UBadge>

          <UPopover arrow>
            <UButton v-if="getSplitData(row, 'divisions').shouldSplit"
              :label="`+  ${getSplitData(row, 'divisions').restItems.length}`" variant="ghost" />

            <template #content>
              <div class="flex flex-wrap gap-2 max-w-sm bg-gray-200 dark:bg-gray-800 rounded-md p-2">
                <UBadge v-for="restItem in getSplitData(row, 'divisions').restItems" :key="restItem.id" color="primary"
                  variant="outline" :label="toTitleCase(restItem.name)">
                </UBadge>

              </div>
            </template>
          </UPopover>

        </div>
      </template>


      <template #action-cell="{ row }">
        <UDropdownMenu :items="getDropdownActions(row.original)">
          <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Actions" />
        </UDropdownMenu>
      </template>

    </UTable>
  </div>
</template>
