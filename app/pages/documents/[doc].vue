<script setup>
const router = useRoute()

const param = router.params.doc

console.log(router.params.doc)

const path = `/documents/${param}`
</script>

<template>
  <div :style="{ width: '1028px', height: '700px' }" />
</template>
