<script setup lang="ts">
import type { Category, Division } from '#shared/types'
import { useVModel } from "@vueuse/core";
import { clampCharacters, clampAndTitleCase, toTitleCase } from '#shared/utils'

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

const limit = 2

const shouldSplit: Ref<boolean> = ref(props.modelValue.length > limit);

// Get the first limit props.modelValue, or all props.modelValue if there are limit or less
const beginningItems: Ref<Items[]> = ref(shouldSplit ? props.modelValue.slice(0, limit) : props.modelValue);

// Get the remaining props.modelValue (starting from index limit)
const restItems: Ref<Items[]> = ref(props.modelValue.slice(limit));
/**
 * Watch local selected IDs for changes (e.g., user selects/unselects an item)
 * and emit the array of Category objects back to the parent component.
 */
const updateModelValue = watch(item_ids, (newVal) => {
  // Emit the computed Category[] array, updating v-model in the parent.
  emits('update:modelValue', itemsToEmit.value)
}, { deep: true })

onUnmounted(() => {
  // Stop watchers to prevent memory leaks
  updateModelValue()
})

</script>

<template>
  <div>
    <UFormField :label="title" name="items">
      <div v-if="edit">
        <UCheckboxGroup v-model="item_ids" indicator="hidden" size="sm" variant="card" :items="options" value-key="id"
          label-key="name" name="item_ids" :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }">
          <template #label="{ item }">
            <UTooltip :text="item.metadata.display_name || item.name">
              <span class="text-xs">{{ clampCharacters(item.metadata.display_name || item.name, 15) }}</span>
            </UTooltip>
          </template>
        </UCheckboxGroup>
      </div>

      <div v-else class="flex flex-wrap gap-2">

        <UBadge v-for="item in beginningItems" :key="item.id" color="primary" variant="outline">
          <UTooltip :text="toTitleCase(item.name)">
            <span class="text-xs">
              {{ clampAndTitleCase(item.name) }}
            </span>
          </UTooltip>
        </UBadge>

        <UPopover arrow>
          <UButton v-if="shouldSplit" :label="`+  ${restItems.length}`" variant="ghost" />

          <template #content>
            <div class="flex flex-wrap gap-2 max-w-sm bg-elevated/25 dark:bg-slate-900 rounded-md p-2">
              <UBadge v-for="restItem in restItems" :key="restItem.id" color="primary" variant="outline">
                {{ toTitleCase(restItem.name) }}
              </UBadge>

            </div>
          </template>
        </UPopover>
      </div>
    </UFormField>
  </div>
</template>
