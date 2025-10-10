<template>
    <div class="grid items-center grid-cols-[auto_1fr] w-full pa-4 my-3" :class="collapsed ? '' : 'gap-2'">
        <img src="/icon.png" class="h-10 w-auto shrink-0" />

        <div v-if="!collapsed" class="grid grid-rows-3 gap-2 ml-2">
            <span class="text-xs leading-2 font-bold tracking-widest">DATA WAREHOUSE</span>
            <span class="text-xs leading-2 font-light">BAPPEDA</span>
            <span class="text-xs leading-2 font-light">Kota Semarang</span>
        </div>
    </div>
</template>

<script setup lang="ts">

defineProps<{
    collapsed?: boolean
}>()

</script>