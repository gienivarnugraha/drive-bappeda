<script setup lang="ts">
import type { Category, Division, Results } from '~/types'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h, resolveComponent } from 'vue'

const UBadge = resolveComponent('UBadge')

const props = defineProps({
  document: {
    type: Object as PropType<Results[] | undefined>,
    required: true
  }
})

const columns: TableColumn<Results>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    meta: {
      class: {
        th: 'text-center font-semibold',
        td: 'text-center font-mono'
      }
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Tanggal',
    cell: ({ row }) => {
      return new Date(row.getValue('created_at')).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  {
    accessorKey: 'filename',
    header: 'Nama File',
  },
  { accessorKey: 'description', header: 'description' },
  { accessorKey: 'title', header: 'title' },
  { accessorKey: 'categories', header: 'categories' },
  { accessorKey: 'divisions', header: 'divisions' },
  { accessorKey: 'metadata', header: 'metadata' },
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


onMounted(() => {
  if (props.document) {
    state.value = props.document
  }
})
</script>

<template>
  <div class="grid grid-cols-1">
    <UTable :data="state" sticky>

      <template #categories-cell="{ row }">
        <div class="flex items-center gap-3">
          <UBadge v-for="item in row.getValue('categories')" :key="item.id" color="primary" variant="outline">
            <UTooltip :text="item.name">
              <span class="text-xs ">{{ clampCharacters(toTitleCase(item.name), 10) }}</span>
            </UTooltip>
          </UBadge>
        </div>
      </template>

      <template #divisions-cell="{ row }">
        <div class="flex items-center gap-3">
          <UBadge v-for="item in row.getValue('divisions')" :key="item.id" color="primary" variant="outline">
            <UTooltip :text="item.name">
              <span class="text-xs ">{{ clampCharacters(toTitleCase(item.name), 10) }}</span>
            </UTooltip>
          </UBadge>
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
