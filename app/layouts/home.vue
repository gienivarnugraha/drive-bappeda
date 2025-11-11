<script setup lang="ts">
const { isSidebarSlideOverOpen } = useDashboard()

const { smAndLarger } = useTailwindBreakpoints()
const route = useRoute()
const isHome = computed(() => route.name === 'home')

</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar id="default" v-model:collapsed="isSidebarSlideOverOpen" collapsible
      class="bg-elevated/25 min-h-full " :collapsed-size="0" :default-size="20" :ui="{
      header: 'lg:border-b lg:border-default h-auto',
      footer: 'lg:border-t lg:border-default'
    }">
      <template #header="{ collapsed }">
        <Logo :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <Chat v-if="!collapsed" :collapsed="collapsed" class="flex-1" />
        <div v-else class=" flex flex-col justify-center gap-2">
          <UDashboardSidebarCollapse icon="i-lucide-message-circle" />
        </div>

      </template>

      <template #footer="{ collapsed }">
        <span class="text-xs text-center">{{ collapsed ? '©' : 'copyright' }} 2025</span>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel id="main">
      <template #header>
        <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
            <UTooltip text="Kembali">
              <UButton v-if="!isHome" variant="ghost" color="neutral" icon="i-lucide-chevron-left" to="/home" />
            </UTooltip>
            <!-- <UButton variant="ghost" color="neutral" icon="i-lucide-home" to="/" /> -->
          </template>

          <template #right>
            <!-- <UTooltip text="Notifications" :shortcuts="['N']">
              <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
                <UChip color="error" inset>
                  <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
                </UChip>
              </UButton>
            </UTooltip> -->

            <UColorModeButton />

            <FileAddModal />

            <UserMenu :collapsed="!smAndLarger" />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
