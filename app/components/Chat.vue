<script setup lang="ts">
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import { markdownToHtml } from '~/utils/markdown'
import { v4 as uuid } from 'uuid'
import type { UIMessage } from '#shared/types/chat'

defineProps<{
  collapsed?: boolean
}>()

const { user } = useUserSession()

const question = ref<string>('')
const status = ref<'ready' | 'error' | 'submitted' | 'streaming'>('ready')


const messages = ref<UIMessage[]>([])

onMounted(() => {

})

let controller: AbortController | null = null

const exampleMessage: string[] = [
  'Jumlah Sampah Yang Dihasilkan Di Kota Semarang',
  'Skenario Dan Proyeksi Pengurangan Sampah Yang Optimal Dengan Gambar Dan Tabel'
]

const submitExampleMessage = (e: Event) => {
  question.value = (e.target as HTMLButtonElement)?.value || ''
  handleSubmit()
}

const handleSubmit = async () => {
  // e.preventDefault()
  status.value = 'submitted'

  // Create new controller for this request
  controller = new AbortController()

  let data = {
    id: uuid(),
    role: "user",
    parts: [{ type: "text", text: question.value }]
  } as UIMessage

  messages.value.push(data)

  try {
    const { type, text } = await $fetch<{ type: string, text: string }>('/api/chat', {
      method: 'post',
      body: {
        question: question.value,
        uuid: user.value?.id
      },
      signal: controller.signal
    })

    messages.value.push({
      id: uuid(),
      role: 'assistant',
      parts: []
    })

    const lastMessageIndex = messages.value.length - 1

    messages.value[lastMessageIndex]?.parts.push({
      type: 'text',
      text: await markdownToHtml(text)
    })

  } catch (error: any) {
    if (error === 'AbortError') {
      console.error('Request aborted')
    } else {
      console.error(error)
      status.value = 'error'
    }
  } finally {
    controller = null
    question.value = ''
    if (status.value !== 'error') {
      status.value = 'ready'
    }
  }
}

const abortRequest = () => {
  if (controller) {
    controller.abort()

    console.error(question.value)

    status.value = 'ready'
  }
}

onUnmounted(() => {
  if (controller) {
    controller.abort()
  }
})

// const reader = response.pipeThrough(new TextDecoderStream()).getReader()

// let markdownMessage = ''

// while (true) {
//     const { value, done } = await reader.read();

//     if (done) {
//         //@ts-ignore
//         messages.value[lastMessageIndex]?.parts.push(markdownMessage)

//         status.value = 'ready'
//         break
//     }

//     status.value = 'streaming'

//     markdownMessage += value

//     //@ts-ignore
//     messages.value[lastMessageIndex]?.parts.push(markdownMessage)

// }
</script>

<template>
  <div v-if="!collapsed" class="flex flex-col justify-between">
    <UChatMessages :messages="messages" :status="status" should-auto-scroll :assistant="{
      side: 'left',
      variant: 'outline',
      avatar: {
        icon: 'i-lucide-bot'
      },
    }" :user="{
      side: 'left',
      variant: 'solid',
      avatar: {
        src: `/file?filename=avatars/${encodeURIComponent(user?.avatar as string)}`,
        alt: user?.name
      }
    }">
      <template #content="{ message }">
        <div class="markdown" v-html="getTextFromMessage(message)" />
      </template>
    </UChatMessages>

    <div class="flex flex-wrap my-4 gap-4 ">
      <UButton v-for="example in exampleMessage" :key="example" class="text-xs" variant="outline" :value="example"
        @click="submitExampleMessage">
        {{ example }}
      </UButton>
    </div>

    <UChatPrompt v-model="question" @submit="handleSubmit">
      <UChatPromptSubmit :status="status" @stop="abortRequest" @reload="handleSubmit" />
    </UChatPrompt>
  </div>
</template>

<style>
div.markdown>p {
  margin-bottom: 1rem;
}
</style>
