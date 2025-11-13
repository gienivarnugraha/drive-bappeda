<script setup lang="ts">
import type { Category, Division } from '#shared/types'
import { useVModel } from "@vueuse/core";
import { clampCharacters, toTitleCase } from '#shared/utils'

type Items = Category | Division

const props = defineProps({
  edit: {
    type: Boolean,
    default: false,
    required: false
  },
  // v-model prop: It receives the actual Category objects from the parent
  modelValue: {
    type: Array as PropType<Items[]>,
    required: true,
  },
  options: {
    type: Array as PropType<Items[]>,
    required: true,
    default: () => []
  },
  title: String
})


const emits = defineEmits(["update:modelValue"]);

// The local state should be an array of IDs (numbers)
// We initialize it by mapping the IDs from the incoming Category objects.
const item_ids: Ref<number[]> = ref(props.modelValue.map(item => item.id))


// Convert selected IDs (item_ids.value) back into Category objects for emitting.
// This is necessary because the parent v-model is bound to Category[] (the prop type).
const itemsToEmit = computed(() => {
  // Filter the full list of available items to only include those whose ID is selected
  const optionsWithId = props.options as Items[];

  // Filter the full list of available options to only include those whose ID is selected
  return optionsWithId.filter(item =>
    item_ids.value.includes(item.id)
  ) as Items[]
})

/**
 * Watch local selected IDs for changes (e.g., user selects/unselects an item)
 * and emit the array of Category objects back to the parent component.
 */
const updateModelValue = watch(item_ids, (newVal) => {
  // Emit the computed Category[] array, updating v-model in the parent.
  console.log('modelValue updated', itemsToEmit.value)
  emits('update:modelValue', itemsToEmit.value)
}, { deep: true })

onUnmounted(() => {
  // Stop watchers to prevent memory leaks
  updateModelValue()
})

/**
 * Splits an array of items into two parts: the first 3 items (or all of them)
 * and the remaining items, also indicating if the total count exceeded 3.
 *
 * @param items The array of Category or Division objects.
 * @returns An object containing the split parts and a boolean flag.
 */
const splitItems = (items: Category[] | Division[], limit: number = 2) => {
  // Determine if the array has more than 3 items
  const shouldSplit = items.length > limit;

  // Get the first limit items, or all items if there are limit or less
  const beginningItems = shouldSplit ? items.slice(0, limit) : items;

  // Get the remaining items (starting from index limit)
  const restItems = items.slice(limit);

  return { shouldSplit, restItems, beginningItems };
};

</script>

<template>
  <div>
    <UFormField :label="title" name="items">
      <div v-if="edit">
        <UCheckboxGroup v-model="item_ids" indicator="hidden" size="sm" variant="card" :items="options" value-key="id"
          label-key="name" name="item_ids" :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }">
          <template #label="{ item }">
            <UTooltip :text="item.name">
              <span class="text-xs">{{ clampCharacters(toTitleCase(item.name), 15) }}</span>
            </UTooltip>
          </template>
        </UCheckboxGroup>
      </div>

      <div v-else class="flex flex-wrap gap-2">

        <UBadge v-for="item in splitItems(modelValue).beginningItems" :key="item.id" color="primary" variant="outline">
          <UTooltip :text="item.name">
            <span class="text-xs">
              {{ clampCharacters(toTitleCase(item.name), 10) }}
            </span>
          </UTooltip>
        </UBadge>

        <UPopover arrow>
          <UButton v-if="splitItems(modelValue).shouldSplit" :label="`+  ${splitItems(modelValue).restItems.length}`"
            variant="ghost" />

          <template #content>
            <div class="flex flex-wrap gap-2 max-w-sm bg-elevated/25 dark:bg-slate-900 rounded-md p-2">
              <UBadge v-for="restItem in splitItems(modelValue).restItems" :key="restItem.id" color="primary"
                variant="outline" :label="toTitleCase(restItem.name)">
              </UBadge>

            </div>
          </template>
        </UPopover>
      </div>
    </UFormField>
  </div>
</template>
