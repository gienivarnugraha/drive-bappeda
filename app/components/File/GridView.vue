<script lang="ts" setup>
import { formatBytes, getClampedFileNameWithExtension, sanitizeUrl, toTitleCase } from '#shared/utils'
import type { DocumentMetadata, Results } from '#shared/types'
import { useItems } from '~/composables/useItems'

const props = defineProps({
  document: {
    type: Object as PropType<Results[]>,
    required: true
  }
})

const state: Ref<Results[]> = ref([])

onMounted(async () => {
  if (props.document) {
    state.value = props.document
  }
})

const thumbnail = ref('')

const { isFileDetailsSlideoverOpen } = useDashboard()

const { divisions, categories } = await useItems()

const selected = ref<Results | null>(null)

const isSelected = (item: Results) => item.id === selected.value?.id

const emits = defineEmits(['update:modelValue'])

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
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
    <UCard v-for="(item, idx) in state" :key="item.id" :class="[isSelected(item) ? 'ring-2 ring-primary' : '']"
      class="cursor-pointer" @click="selectDocument(item)">
      <template #header>
        <div class="flex flex-col gap-4 ">
          <div class="flex justify-between align-center">
            <p class="text-gray text-xs"> {{ getClampedFileNameWithExtension(item.filename ?? '', 10) }}
            </p>
            <UTooltip :text="`Buka ${item.filename}`">
              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-eye"
                :to="`/show?filename=${item.filename}&page=3`" />

            </UTooltip>
          </div>

        </div>
      </template>

      <!-- <img :src="item.metadata.thumbnailSrc" class="w-full h-24 sm:h-30 object-cover rounded" /> -->
      <img :src="`/file?filename=${encodeURIComponent(item.metadata.thumbnailSrc)}`"
        class="w-full h-24 sm:h-30 object-cover rounded" />

      <template #footer>
        <div class="grid gap-2">
          <p class="text-primary text-xs font-bold line-clamp-1">
            {{ toTitleCase(item.title ?? '') }}
          </p>

          <p class="text-gray text-xs">
            {{ formatBytes(item.metadata.fileSize ?? 0) }}
          </p>

          <FormItemsSelector :key="item.id" v-model="item.divisions" :options="categories" title="Bidang" />
          <FormItemsSelector :key="item.id" v-model="item.categories" :options="divisions" title="Kategori" />
        </div>
      </template>
    </UCard>
  </div>
</template>
