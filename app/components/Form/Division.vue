<script setup lang="ts">
import { useItems } from '~/composables/useItems';
import type { Division } from '~/types';

const props = defineProps({
    edit: {
        type: Boolean,
        default: false,
        required: false
    },
    modelValue: {
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

// const setData = (data: Division[]) => {
//     division_id.value = data.map((division: Division) => division.id)
// }

// const watcherDivisions = watch(() => props.modelValue, (newVal) => {
//     console.log('model value changed')
//     setData(newVal)
// })

onMounted(() => {
    // setData(props.modelValue)
})

onUnmounted(() => {
    console.log('FormDivision unmounted')
    watcher()
    // watcherDivisions()
})

</script>

<template>
    <div>
        <UFormField label="Bidang" name="divisions">
            <UCheckboxGroup v-if="edit" indicator="hidden" size="sm" variant="card" :items="availableDivisions"
                value-key="id" label-key="name" v-model="division_id" name="division_id"
                :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-2' }" />
            <div v-else class="flex flex-wrap gap-2">
                <UBadge v-for="division in modelValue" :key="division.id" color="primary" variant="outline"
                    :label="toTitleCase(division.name)" />
            </div>
        </UFormField>
    </div>
</template>