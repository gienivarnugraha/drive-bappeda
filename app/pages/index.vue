<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { isFileDetailsSlideoverOpen } = useDashboard()

const documents: any = ref([])
const getDocuments = async function (query: any) {
  try {
    console.log(query)

    const data = await $fetch('/api/documents', { query })

    console.log(data)

    documents.value = data


  } catch (error) {
    console.log(error)
  }
}

const categories = ref(['Semua', 'Pemerintahan', 'Pemb-Manusia', 'Kes-Mas', 'Ekonomi', 'SDA', 'Infrastruktur', 'Kewilayahan', 'PPE'])
const selected = ref()
const selectedDocument = ref()

const selectDocument = (document: any) => {
  isFileDetailsSlideoverOpen.value = true
  selectedDocument.value = document
}

const infraCat = ref(['Air Minum', 'Sanitasi', 'Persampahan'])

onMounted(() => {
  getDocuments({ category: 'Semua' })
})

watch(
  () => selected.value,
  (val) => getDocuments({ category: val })
)
</script>

<template>
  <div class="flex flex-row gap-4">
    <div class="flex flex-col gap-4">
      <UDashboardToolbar>
        <div class="my-2 flex flex-wrap">
          <URadioGroup indicator="hidden" size="sm" variant="card" default-value="Semua" legend="Kategori"
            :items="categories" orientation="horizontal" v-model="selected" />

          <div v-if="selected === 'Infrastruktur'" class="flex flex-row flex-wrap gap-4 smw-full lg:max-w-2xl my-2">
            <UCheckbox v-for="infra in infraCat" color="primary" variant="card" size="xs" indicator="hidden"
              :label="infra" />
          </div>
        </div>
      </UDashboardToolbar>


      <div class="flex px-4 sm:px-6 ">
        <div v-if="documents" class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
          <FileThumbnail v-for="document in documents" :key="document.id" :document="document"
            @click="selectDocument(document)" />
        </div>
        <div v-else> Tidak ada file </div>

      </div>


    </div>
    <FileDetailsSlideOver :document="selectedDocument" />

  </div>
</template>