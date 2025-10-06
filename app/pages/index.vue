<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [
  [{
    label: 'New file',
    icon: 'i-lucide-file',
    to: '/add-file'
  },
  ]] satisfies DropdownMenuItem[][]

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

const infraCat = ref(['Air Minum', 'Sanitasi', 'Persampahan'])


watch(
  () => selected.value,
  (val) => getDocuments({ category: val })
)
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UColorModeButton />

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

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

    </template>

    <template #body>
      <div v-if="documents" class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
        <FileThumbnail v-for="document in documents" :key="document.id" :document="document" />
      </div>
      <div v-else> Tidak ada file </div>
    </template>
  </UDashboardPanel>
</template>
