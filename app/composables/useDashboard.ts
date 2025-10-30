import { createSharedComposable } from '@vueuse/core'

const _useDashboard = () => {
  const route = useRoute()
  const router = useRouter()
  const isNotificationsSlideoverOpen = ref(false)
  const isFileDetailsSlideoverOpen = ref(false)
  const isSidebarSlideOverOpen = ref(false)

  defineShortcuts({
    //   'g-h': () => router.push('/'),
    //   'g-i': () => router.push('/inbox'),
    //   'g-c': () => router.push('/customers'),
    //   'g-s': () => router.push('/settings'),
    'o': () => isSidebarSlideOverOpen.value = !isSidebarSlideOverOpen.value,
    'n': () => isNotificationsSlideoverOpen.value = !isNotificationsSlideoverOpen.value
  })


  const watcher = watch(() => route.fullPath, () => {
    isNotificationsSlideoverOpen.value = false
  })

  watch(isFileDetailsSlideoverOpen, () => {
    console.log(isFileDetailsSlideoverOpen.value)
  })
  watch(isSidebarSlideOverOpen, () => {
    console.log(isSidebarSlideOverOpen.value)
  })

  onUnmounted(() => {
    watcher()
  })

  return {
    isNotificationsSlideoverOpen,
    isFileDetailsSlideoverOpen,
    isSidebarSlideOverOpen,
  }
}

export const useDashboard = createSharedComposable(_useDashboard)
