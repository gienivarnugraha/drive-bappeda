<script setup lang="ts">
import type { Category, Division, Results } from '~/types'

const props = defineProps({
  document: {
    type: Object as PropType<Results[] | undefined>,
    required: true
  }
})

const state: Ref<Results[]> = ref([])

onMounted(() => {
  if (props.document) {
    state.value = props.document
  }
})
</script>

<template>
  <div class="grid grid-cols-1">
    <UTable :data="state" />
  </div>
</template>
