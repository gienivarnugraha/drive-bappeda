<script setup lang="ts">
const { isSidebarSlideOverOpen, isNotificationsSlideoverOpen } = useDashboard()

const toast = useToast()

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Accept',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Opt out',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar id="default" v-model:open="isSidebarSlideOverOpen" collapsible class="bg-elevated/25 min-h-full "
      :collapsed-size="0" :default-size="25" :ui="{
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
        <span class="text-xs text-center">{{ collapsed ? '' : 'copyright' }} © 2024</span>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel id="main">
      <template #header>
        <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
            <UButton variant="ghost" color="neutral" icon="i-lucide-home" to="/" />
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

            <FileAddModal />

            <UserMenu />
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
