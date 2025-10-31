<script setup lang="ts">
import { useItems } from '~/composables/useItems';
import type { Category } from '~/types';

const props = defineProps({
    edit: {
        type: Boolean,
        default: false,
        required: false
    },
    categories: {
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

onMounted(() => {
    if (props.categories) {
        category_id.value = props.categories.map((category: Category) => category.id)
    }
})

onUnmounted(() => {
    watcher()
})

</script>
<template>
    <div>

        <UFormField label="Kategori" name="categories">
            {{ category_id }}
            <UCheckboxGroup v-if="edit" indicator="hidden" size="sm" variant="card" :items="availableCategories"
                value-key="id" label-key="name" v-model="category_id" name="category_id"
                :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }" />
            <div v-else class="flex flex-wrap gap-2">
                <UBadge v-for="category in categories" :key="category.id" color="primary" variant="outline"
                    :label="toTitleCase(category.name)" />
            </div>
        </UFormField>
    </div>

</template>