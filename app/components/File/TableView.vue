<script setup lang="ts">
import type { Category, Division, Results } from '~/types'

const props = defineProps({
    document: {
        type: Object as PropType<Results[] | undefined>,
        required: true
    },
})


const state: Ref<Results[]> = ref([])

onMounted(() => {
    if (props.document) {
        state.value = props.document
    }
})

</script>

<template>
    <UTable :data="state" class="w-full">

    </UTable>
</template>