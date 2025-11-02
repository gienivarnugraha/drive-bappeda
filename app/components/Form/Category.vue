<script setup lang="ts">
import { useItems } from '~/composables/useItems'
import type { Category } from '~/types'

defineProps({
  edit: {
    type: Boolean,
    default: false,
    required: false
  },
  modelValue: {
    type: Array as PropType<Category[]>,
    default: []
  }
})

const { categories: availableCategories } = await useItems()

const category_id: Ref<number[]> = ref([])

const emit = defineEmits(['update:modelValue'])

const watcher = watch(category_id, (newVal) => {
  emit('update:modelValue', newVal)
})

// const watcherDivisions = watch(() => props.modelValue, (newVal) => {
//     setData(newVal)
// })

// const setData = (data: Category[]) => {
//     category_id.value = data.map((category: Category) => category.id)
// }

// onMounted(() => {
//     setData(props.modelValue)
// })

onUnmounted(() => {
  watcher()
  // watcherDivisions()
})
</script>

<template>
  <div>
    UFormField label="Kategori" name="categories"
    <div v-if="edit">
      <UCheckboxGroup v-model="category_id" indicator="hidden" size="sm" variant="card" :items="availableCategories"
        value-key="id" label-key="name" name="category_id" :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }">
        <template #label="{ item }">
          <UTooltip :text="item.name">
            <span class="text-xs">{{ clampCharacters(toTitleCase(item.name), 15) }}</span>
          </UTooltip>
        </template>
      </UCheckboxGroup>
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <UBadge v-for="item in modelValue" :key="item.id" color="primary" variant="outline">
        <UTooltip :text="item.name">
          <span class="text-xs ">{{ clampCharacters(toTitleCase(item.name), 10) }}</span>
        </UTooltip>
      </UBadge>
    </div>
  </div>
</template>
