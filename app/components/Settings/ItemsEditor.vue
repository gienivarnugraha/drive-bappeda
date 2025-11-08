<script setup lang="ts">
import { z } from 'zod';
import type { PropType, Ref } from 'vue';
import type { Category, Division } from '~/types'; // Assuming this path is correct

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
const supabase = useSupabaseClient();

const onDelete = (item: Item) => {
  toast.add({
    title: 'Apakah anda yakin?',
    description: `${props.title} akan dihapus secara permanen`,
    duration: 0,
    actions: [{
      label: 'Hapus',
      onClick: e => {
        deleteItem(item);
      },
      variant: 'solid',
      color: 'error'
    }]
  })
}

const deleteItem = async (item: Item) => {
  const { error } = await supabase.from(props.type)
    .delete()
    .eq('id', item.id)

  if (error) {
    toast.add({
      title: 'Error',
      description: error.details || 'An unknown error occurred.',
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    });
  }

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
}

const onSubmit = async (itemData: FormSchema | Item) => {

  const { name, ...payload } = itemData as FormSchema;

  const { data, error } = await supabase
    .from(props.type)
    .upsert({ name: convertToKebabCase(name), metadata: { ...payload } }, { onConflict: 'name' })
    .select()
    .limit(1)
    .single()

  if (data) {
    items.value.push(data as unknown as Item);

    toast.add({
      title: 'Success',
      description: `Success add ${data.name}`,
      icon: 'i-lucide-check',
      color: 'success'
    })

  } else if (error) {
    toast.add({
      title: 'Error',
      description: error.details || 'An unknown error occurred.',
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    });
  }

};
</script>

<template>
  <UPageCard :title="title" :description="`Rubah ${title?.toLowerCase()}`" variant="subtle">

    <div class="flex flex-row space-y-1 flex-wrap">
      <div v-for="item in items" :key="item.id" class="flex flex-row items-center justify-between space-x-1 px-2 py-1">
        <UTooltip :text="item.name">
          <UBadge class="font-bold rounded-full">
            <p class="text-xs"> {{ clampCharacters(toTitleCase(item.metadata?.name || item.name), 20) }}</p>
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