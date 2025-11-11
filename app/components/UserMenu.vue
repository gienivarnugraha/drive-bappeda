<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useUser } from '~/composables/useUser'

defineProps<{
  collapsed?: boolean
}>()

const user = ref({
  display_name: '',
  avatar: {
    src: '',
    alt: ''
  }
})

const config = useRuntimeConfig()

onMounted(async () => {
  const { user: profile } = await useUser()

  if (profile) {
    user.value.display_name = profile.value.display_name || ''
    user.value.avatar.src = sanitizeUrl(`${config.public.avatarUrl}/${profile.value.avatar || ''}`)
    user.value.avatar.alt = profile.value.display_name || ''
  }
})

const logout = async () => {
  const supabase = useSupabaseClient()

  try {
    await supabase.auth.signOut()

    navigateTo('/')

  } catch (error) {
    console.error(error)
  }
}

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value.display_name,
  avatar: user.value.avatar
}], [{
  label: 'Settings',
  icon: 'i-lucide-settings',
  to: '/settings'
}], [{
  label: 'Log out',
  icon: 'i-lucide-log-out',
  onSelect: () => {
    logout()
  }
}]]))
</script>

<template>
  <ClientOnly>
    <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }"
      :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
      <UButton v-bind="{
      ...user,
      label: collapsed ? undefined : user?.display_name,
      trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
    }" color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-elevated" :ui="{
      trailingIcon: 'text-dimmed'
    }" />

      <template #chip-leading="{ item }">
        <span :style="{
      '--chip-light': `var(--color-${(item as any).chip}-500)`,
      '--chip-dark': `var(--color-${(item as any).chip}-400)`
    }" class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)" />
      </template>
    </UDropdownMenu>
  </ClientOnly>
</template>
