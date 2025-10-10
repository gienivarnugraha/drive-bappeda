<script setup lang="ts">
import { getTextFromMessage } from '@nuxt/ui/utils/ai'

import { v4 as uuid } from 'uuid'

defineProps<{
    collapsed?: boolean
}>()

let question = ref<string>('')
let threadId = uuid()
let status = ref<'ready' | 'error' | 'submitted' | 'streaming'>('ready')

type ChatMessage = {
    id: string
    role: 'user' | 'assistant'
    parts: {
        type: string, text: string
    }[]

}

const messages = ref<ChatMessage[]>([
    {
        id: uuid(),
        role: 'user',
        parts: [
            {
                type: 'text',
                text: 'Hello AI! How are you today?'

            }
        ]

    },
    {
        id: uuid(),
        role: 'assistant',
        parts: [
            {
                type: 'text',
                text: 'Hello, Im Fine'

            }
        ]
    }
])

const exampleMessage: string[] = [
    'Jumlah Sampah Yang Dihasilkan Di Kota Semarang',
    'Skenario Dan Proyeksi Pengurangan Sampah Yang Optimal Dengan Gambar Dan Tabel',
]


const submitExampleMessage = (e: Event) => {
    // question.value = e.target.value
    handleSubmit(e)
}

const handleSubmit = async (e: Event) => {
    e.preventDefault()
    status.value = 'submitted'
    //   chat.sendMessage({ text: input.value })

    messages.value.push({
        id: uuid(),
        role: 'user',
        parts: [{ type: 'text', text: question.value }]
    } satisfies ChatMessage)

    // messages.value.push({ role: 'assistant', message: '' })

    // const response = await $fetch<ReadableStream>('/api/chat', {
    //     method: 'post',
    //     body: {
    //         question: question.value,
    //         uuid: threadId
    //     },
    //     responseType: 'stream',
    // })

    // const lastMessageIndex = messages.value.length - 1

    // const reader = response.pipeThrough(new TextDecoderStream()).getReader()

    // let markdownMessage = ''

    // while (true) {
    //     const { value, done } = await reader.read();

    //     if (done) {
    //         //@ts-ignore
    //         messages.value[lastMessageIndex].message = markdownMessage

    //         status.value = 'ready'
    //         break
    //     }

    //     status.value = 'streaming'

    //     markdownMessage += value

    //     //@ts-ignore
    //     messages.value[lastMessageIndex].message = markdownMessage

    // }
    setTimeout(() => {
        status.value = 'ready'
    }, 2000)
    question.value = ''
}
</script>

<template>
    <div v-if="!collapsed" class="flex flex-col h-full">
        <!-- <UChatMessages :messages="chat.messages" :status="chat.status"> -->
        <UChatMessages :messages="messages" :status="status" :user="{
        side: 'left',
        variant: 'solid',
        avatar: {
            src: 'https://github.com/benjamincanac.png'
        }
    }">
            <template #content="{ message }">
                <MDC :value="getTextFromMessage(message)" :cache-key="message.id" unwrap="p" />
            </template>
        </UChatMessages>

        <UChatPrompt v-model="question" @submit="handleSubmit">
            <!-- <UChatPrompt v-model="input" :error="chat.error" @submit="handleSubmit"> -->
            <UChatPromptSubmit :status="status" />
            <!-- <UChatPromptSubmit :status="chat.status" @stop="chat.stop" @reload="chat.regenerate" /> -->
        </UChatPrompt>
    </div>
</template>
