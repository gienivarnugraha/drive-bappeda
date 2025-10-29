<script lang="ts" setup>
import { formatBytes, dateToLocale } from '#imports';
import type { FilteredData, Results } from '~/types';

const props = defineProps({
    data: {
        type: Object as PropType<Results>,
        required: true
    },
    isSelected: {
        type: Boolean,
    }
})

const thumbnail = `documents/${props.data.metadata.thumbnailSrc}`

</script>

<template>
    <ClientOnly>
        <UCard :id="data.metadata.fileId" :class="[isSelected ? 'ring-2 ring-primary' : '']" class="cursor-pointer">
            <template #header>
                <div class="flex flex-col gap-4 ">
                    <div class="flex justify-between align-center">
                        <p class="text-gray text-xs"> {{ data.filename }} </p>
                        <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" />
                    </div>

                </div>
            </template>

            <img :src="thumbnail" class="w-full h-full"></img>

            <template #footer>
                <div class="grid gap-2">

                    <p class="text-primary text-xs font-bold"> {{ data.title }} </p>

                    <p class="text-gray text-xs"> {{ formatBytes(data.metadata.filesize) }} </p>

                    <p class="text-xs">Bidang:</p>
                    <div class="flex flex-wrap gap-2">
                        <UBadge v-for="division in data.divisions" :key="division.id" color="primary" variant="outline"
                            :label="division.name" />

                    </div>

                    <p class="text-xs">Kategori:</p>
                    <UBadge v-for="category in data.categories" :key="category.id" color="primary" variant="outline"
                        :label="category.name" />
                </div>
            </template>
        </UCard>
    </ClientOnly>
</template>
