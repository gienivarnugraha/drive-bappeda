<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/types'
import type { User } from '#auth-utils'

defineProps<{
  collapsed?: boolean
}>()

const user = ref({
  name: '',
  avatar: {
    src: '',
    alt: ''
  }
})

const { user: profile, clear } = useUserSession()

const setData = async (data: User) => {
  user.value.name = data.name || ''
  user.value.avatar.src = `/file?filename=avatars/${encodeURIComponent(data.avatar as string)}`
  user.value.avatar.alt = data.name || ''
}


const watcher = watch(() => profile.value, (val) => {
  if (val) {
    setData(val)
  }
})

onMounted(() => {
  setData(profile.value as User)
})

onUnmounted(() => {
  watcher()
})


const logout = async () => {
  try {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    })

    await clear()

    await navigateTo('/')

  } catch (error) {
    console.error(error)
  }
}

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value.name,
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
        label: collapsed ? undefined : user?.name,
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
