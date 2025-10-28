import { createSharedComposable } from '@vueuse/core'

const _useDashboard = () => {
  const route = useRoute()
  const router = useRouter()
  const isNotificationsSlideoverOpen = ref(false)
  const isFileDetailsSlideoverOpen = ref(false)
  const addModalOpen = ref(false)

  defineShortcuts({
    'g-h': () => router.push('/'),
    'g-i': () => router.push('/inbox'),
    'g-c': () => router.push('/customers'),
    'g-s': () => router.push('/settings'),
    'n': () => isNotificationsSlideoverOpen.value = !isNotificationsSlideoverOpen.value
  })

  watch(() => route.fullPath, () => {
    isNotificationsSlideoverOpen.value = false
  })

  watch(() => addModalOpen, (val) => {
    console.log(val)
  })

  return {
    isNotificationsSlideoverOpen,
    isFileDetailsSlideoverOpen,
    addModalOpen
  }
}

export const useDashboard = createSharedComposable(_useDashboard)
