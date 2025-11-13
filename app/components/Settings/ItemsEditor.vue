<script setup lang="ts">
import { z } from 'zod';
import type { PropType, Ref } from 'vue';
import type { Category, Division } from '#shared/types'; // Assuming this path is correct
import { toTitleCase, toKebabCase, clampCharacters } from '#shared/utils'

type Item = Category | Division;

const toast = useToast();

const props = defineProps({
  options: {
    type: Array as PropType<Item[]>,
    required: true,
    default: () => []
  },
  type: {
    type: String as PropType<'categories' | 'divisions'>,
    required: true,
  },
  title: String,
  additionalFields: {
    type: Object as PropType<Record<string, string>>,
    required: false,
    default: () => ({}),
  },
});

const Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
});

type FormSchema = z.output<typeof Schema>;

const state = reactive<FormSchema>({
  name: '',
});

// Initialize dynamic fields into the reactive state after state creation
for (const key in props.additionalFields) {
  // Use bracket notation to safely assign dynamic keys
  // TypeScript will allow this assignment because the key is part of the merged Schema
  (state as Record<string, any>)[key] = props.additionalFields[key];
}

onMounted(() => {
  items.value = props.options;
})
const items: Ref<Item[]> = ref([]);
const addView = ref(false);

const onDelete = (item: Item) => {
  toast.add({
    title: 'Apakah anda yakin?',
    description: `${props.title} akan dihapus secara permanen`,
    duration: 0,
    actions: [{
      label: 'Hapus',
      onClick: (e: any) => {
        deleteItem(item);
      },
      variant: 'solid',
      color: 'error'
    }]
  })
}

const deleteItem = async (item: Item) => {
  try {
    const data = await $fetch<Item>(`/api/${props.type}`, {
      method: 'DELETE',
      body: { id: item.id }
    })


    const index = items.value.findIndex(i => i.id === item.id);

    if (index !== -1) {
      items.value.splice(index, 1);
    }

    toast.add({
      title: 'Success',
      description: `Succes delete ${item.name}`,
      icon: 'i-lucide-check',
      color: 'success'
    });

  } catch (error: any) {

    toast.add({
      title: 'Error',
      description: error.message || 'An unknown error occurred.',
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    });
  }
}

const onSubmit = async (itemData: FormSchema | Item) => {

  const { name, ...payload } = itemData as FormSchema;

  try {
    const data = await $fetch<Item>(`/api/${props.type}`, {
      method: 'POST',
      body: {
        name: toKebabCase(name),
        metadata: { ...payload }
      }
    })


    if (data) {
      items.value.push(data as unknown as Item);

      toast.add({
        title: 'Success',
        description: `Success adding ${name}`,
        icon: 'i-lucide-check',
        color: 'success'
      })
    }

  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'An unknown error occurred.',
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    });

  }

};
</script>

<template>
  <UPageCard :title="title" :description="`Rubah ${title?.toLowerCase()}`" variant="subtle"
    class="bg-linear-to-tl from-primary/10 from-5% to-default">

    <div class="flex flex-row space-y-1 flex-wrap">
      <div v-for="item in items" :key="item.id" class="flex flex-row items-center justify-between space-x-1 px-2 py-1">
        <UTooltip :text="item.name">
          <UBadge class="font-bold rounded-full">
            <p class="text-xs"> {{ clampCharacters(toTitleCase(item.metadata?.display_name || item.name), 20) }}</p>
            <template #trailing>
              <UButton color="error" variant="ghost" size="sm" icon="i-lucide-trash" @click="onDelete(item)" />
            </template>
          </UBadge>
        </UTooltip>
      </div>
    </div>

    <div class="mt-4 mb-4">
      <UButton variant="subtle" :label="`Tambah ${title}`" color="primary" size="sm"
        :icon="addView ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" @click="addView = !addView" />
    </div>

    <UForm v-if="addView" :schema="Schema" :state="state" class="flex flex-col gap-4 max-w-md"
      @submit="onSubmit(state as FormSchema)">
      <UFormField v-for="key in Object.keys(state)" :key="key" :name="key" :label="toTitleCase(key)"
        :description="`Enter the value for ${key}`" class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="(state as Record<string, any>)[key]" :placeholder="`New ${key}`" class="w-full" />
      </UFormField>

      <UButton type="submit" label="Submit" color="primary" class="max-w-fit" />
    </UForm>
  </UPageCard>
</template>