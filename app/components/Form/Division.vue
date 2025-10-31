<script setup lang="ts">
import { useItems } from '~/composables/useItems';
import type { Division } from '~/types';

const props = defineProps({
    edit: {
        type: Boolean,
        default: false,
        required: false
    },
    divisions: {
        type: Array as PropType<Division[]>,
        default: []
    }
})

const { divisions: availableDivisions } = await useItems()

const division_id: Ref<number[]> = ref([])

const emit = defineEmits(['update:modelValue'])

const watcher = watch(division_id, (newVal) => {
    emit('update:modelValue', newVal)
})

onMounted(() => {
    if (props.divisions) {
        division_id.value = props.divisions.map((division: Division) => division.id)
    }
})

onUnmounted(() => {
    watcher()
})

</script>

<template>
    <div>
        <UFormField label="Bidang" name="divisions">
            {{ division_id }}
            <UCheckboxGroup v-if="edit" indicator="hidden" size="sm" variant="card" :items="availableDivisions"
                value-key="id" label-key="name" v-model="division_id" name="division_id"
                :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }" />
            <div v-else class="flex flex-wrap gap-2">
                <UBadge v-for="division in divisions" :key="division.id" color="primary" variant="outline"
                    :label="toTitleCase(division.name)" />
            </div>
        </UFormField>
    </div>
</template>