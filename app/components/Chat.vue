<script setup lang="ts">
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import { markdownToHtml } from '~/utils/markdown'
import { v4 as uuid } from 'uuid'
import { useUser } from '~/composables/useUser'

defineProps<{
  collapsed?: boolean
}>()

const { user } = await useUser()

const question = ref<string>('')
const threadId = uuid()
const status = ref<'ready' | 'error' | 'submitted' | 'streaming'>('ready')

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  parts: {
    type: string
    text: string
  }[]
}

const messages = ref<ChatMessage[]>([])

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

  messages.value.push({
    id: uuid(),
    role: 'user',
    parts: [{ type: 'text', text: question.value }]
  })

  try {
    const { type, text } = await $fetch<{ type: string, text: string }>('/api/chat', {
      method: 'post',
      body: {
        question: question.value,
        uuid: threadId
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
      type,
      text: await markdownToHtml(text)
    })

  } catch (error: any) {
    if (error === 'AbortError') {
      console.log('Request aborted')
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

    console.log(question.value)

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
        src: user.avatar,
        alt: user.display_name
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
