<script lang="ts" setup>
import { formatBytes, dateToLocale } from '#imports';
import type { FilteredData, Results } from '~/types';


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

const { isFileDetailsSlideoverOpen, isSidebarSlideOverOpen } = useDashboard()

const selected = ref<Results | null>(null)

const isSelected = (item: Results) => item.id === selected.value?.id

const emits = defineEmits(['update:modelValue'])

const thumbnail = (data: Results) => `documents/${data.metadata.thumbnailSrc}`

const selectDocument = (data: Results) => {
    if (selected.value?.id === data.id) {
        emits('update:modelValue', null)
        selected.value = null
        isFileDetailsSlideoverOpen.value = false
        return
    }

    emits('update:modelValue', data)
    selected.value = data
}

</script>

<template>
    <ClientOnly>
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <UCard :class="[isSelected(item) ? 'ring-2 ring-primary' : '']" class="cursor-pointer"
                v-for="(item, idx) in state" :key="item.id" @click="selectDocument(item)">
                <!-- <template #header>
                    <div class="flex flex-col gap-4 ">
                        <div class="flex justify-between align-center">
                            <p class="text-gray text-xs"> Nama File: {{ data.filename }} </p>
                            <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" />
                        </div>
    
                    </div>
                </template> -->

                <img :src="thumbnail(item)" class="w-full h-24 sm:h-30 object-cover rounded"></img>

                <template #footer>
                    <div class="grid gap-2">

                        <p class="text-primary text-xs font-bold line-clamp-1"> {{ toTitleCase(item.title) }} </p>

                        <p class="text-gray text-xs"> {{ formatBytes(item.metadata.filesize) }} </p>

                        <FormDivision v-model="item.divisions" :key="item.id" />

                        <FormCategory v-model="item.categories" :key="item.id" />

                    </div>
                </template>
            </UCard>

        </div>
    </ClientOnly>
</template>
