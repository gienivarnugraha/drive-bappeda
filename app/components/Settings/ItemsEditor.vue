<script setup lang="ts">
import { z } from 'zod';
import type { PropType, Ref } from 'vue';
import type { Category, Division } from '~/types'; // Assuming this path is correct
import { mergeZodAdditionalFields } from '~/utils';

type Item = Category | Division;
const toast = useToast();

const props = defineProps({
  options: {
    type: Array as PropType<Item[]>,
    required: true,
    default: () => []
  },
  type: {
    type: String as PropType<'category' | 'division'>,
    required: true,
  },
  additionalFields: {
    type: Object as PropType<Record<string, string>>,
    required: false,
    default: () => ({}),
  },
});

const baseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
});

const finalSchema = mergeZodAdditionalFields(baseSchema, props.additionalFields);

type FormSchema = z.output<typeof finalSchema>;

const state = reactive<FormSchema>({
  name: '',
});

// Initialize dynamic fields into the reactive state after state creation
for (const key in props.additionalFields) {
  // Use bracket notation to safely assign dynamic keys
  // TypeScript will allow this assignment because the key is part of the merged Schema
  (state as Record<string, any>)[key] = props.additionalFields[key];
}

const items: Ref<Item[]> = ref([...props.options]);
const addView = ref(false);

const submit = async (itemData: FormSchema | Item, shouldDelete = false) => {

  try {
    const { data, message } = await $fetch<{ message: string, data: Category | Division }>(`/api/${props.type}`, {
      method: 'POST',
      body: {
        shouldDelete: false,
        ...itemData
      },
    });

    // --- Update Local State ---
    if (shouldDelete) {
      // Deletion: Find and remove item by ID
      const index = items.value.findIndex(i => i.id === data.id);
      if (index !== -1) {
        items.value.splice(index, 1);
      }
    } else {
      // Creation/Update: Add the newly created item to the list
      items.value.push(data);
      // Reset state for new entry
      Object.assign(state, {
        name: '',
        ...props.additionalFields // Reset dynamic fields to initial values
      });
    }

    toast.add({
      title: 'Success',
      description: message,
      icon: 'i-lucide-check',
      color: 'success'
    });
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'An unknown error occurred.',
      icon: 'i-lucide-alert-triangle',
      color: 'danger'
    });
  }
};
</script>

<template>
  <UPageCard :title="type" :description="`Rubah ${type}s`" variant="subtle">

    <div class="flex flex-row space-y-1 flex-wrap">
      <div v-for="item in items" :key="item.id" class="flex flex-row items-center justify-between space-x-1 px-2 py-1">
        <UTooltip :text="item.name">
          <UBadge class="font-bold rounded-full">
            <p class="text-xs"> {{ clampCharacters(toTitleCase(item.name), 20) }}</p>
            <template #trailing>
              <UButton color="red" variant="ghost" size="sm" icon="i-lucide-trash" @click="submit(item, true)" />
            </template>
          </UBadge>
        </UTooltip>
      </div>
    </div>

    <div class="mt-4 mb-4">
      <UButton variant="subtle" :label="`Tambah ${toTitleCase(type)}`" color="primary" size="sm"
        :icon="addView ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" @click="addView = !addView" />
    </div>

    <UForm v-if="addView" :schema="finalSchema" :state="state" class="flex flex-col gap-4 max-w-md"
      @submit="submit(state as FormSchema)">
      <UFormField v-for="key in Object.keys(state)" :key="key" :name="key" :label="toTitleCase(key)"
        :description="`Enter the value for ${key}`" class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="(state as Record<string, any>)[key]" :placeholder="`New ${key}`" class="w-full" />
      </UFormField>

      <UButton type="submit" label="Submit" color="primary" />
    </UForm>
  </UPageCard>
</template>