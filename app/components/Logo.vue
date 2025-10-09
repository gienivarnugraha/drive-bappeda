<template>
    <div class="grid items-center grid-cols-[auto_1fr] w-full align-center pa-4" :class="collapsed ? '' : 'gap-2'">
        <img src="/icon.png" class="h-12 " />

        <div v-if="!collapsed" class="grid grid-rows-3 gap-0.5 ml-2">
            <span class="text-sm leading-2 font-bold tracking-widest">DATA WAREHOUSE</span>
            <span class="text-xs leading-3 font-light">Badan Pembangunan Daerah</span>
            <span class="text-xs leading-2 font-light">Kota Semarang</span>
        </div>
    </div>
</template>

<script setup lang="ts">

defineProps<{
    collapsed?: boolean
}>()

</script>