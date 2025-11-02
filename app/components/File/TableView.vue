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
  <div class="flex">
    <UTable :data="state" class="max-w-full" />
  </div>
</template>
