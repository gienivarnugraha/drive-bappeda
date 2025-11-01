<script setup lang="ts">
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import { markdownToHtml } from '~/utils/markdown'
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

const messages = ref<ChatMessage[]>([])

onMounted(() => {
    messages.value.push(
        {
            id: uuid(),
            role: 'user',
            parts: [
                {
                    type: 'text',
                    text: 'Hello AI!'

                },
                {
                    type: 'text',
                    text: 'How are you today?'

                }
            ]

        },
        {
            id: uuid(),
            role: 'assistant',
            parts: [
                {
                    type: 'text',
                    text: '##Hello, Im Fine'

                }
            ]
        }
    )
})

const controller = new AbortController();
const signal = controller.signal;

const exampleMessage: string[] = [
    'Jumlah Sampah Yang Dihasilkan Di Kota Semarang',
    'Skenario Dan Proyeksi Pengurangan Sampah Yang Optimal Dengan Gambar Dan Tabel',
]


const submitExampleMessage = (e: Event) => {
    question.value = e.target?.value
    handleSubmit(e)
}

const handleSubmit = async (e: Event) => {
    e.preventDefault()
    status.value = 'submitted'

    messages.value.push({
        id: uuid(),
        role: 'user',
        parts: [{ type: 'text', text: question.value }]
    })

    try {
        // const response = await $fetch<ReadableStream>('/api/chat', {
        const { type, text } = await $fetch<{ type: string, text: string }>('/api/chat', {
            method: 'post',
            body: {
                question: question.value,
                uuid: threadId
            },
            signal
            // responseType: 'stream',
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

        console.log(messages.value[lastMessageIndex])

    } catch (error) {
        console.error(error)
        status.value = 'error'
    } finally {
        question.value = ''
        if (status.value !== 'error') {
            status.value = 'ready'
        }
    }

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

}
</script>

<style>
div.markdown>p {
    margin-bottom: 1rem;
}
</style>

<template>
    <div v-if="!collapsed" class="flex flex-col justify-between">
        <UChatMessages :messages="messages" :status="status" :user="{
            side: 'left',
            variant: 'solid',
            avatar: {
                src: 'https://github.com/benjamincanac.png'
            }
        }">
            <template #content="{ message }">
                <div class="markdown" v-html="getTextFromMessage(message)"> </div>
            </template>
        </UChatMessages>

        <div class="flex flex-wrap my-4 gap-4 ">
            <UButton v-for="example in exampleMessage" class="text-xs" :key="example" variant="outline"
                @click="submitExampleMessage" :value="example">
                {{ example }}
            </UButton>
        </div>

        <UChatPrompt v-model="question" @submit="handleSubmit">
            <UChatPromptSubmit :status="status" />
        </UChatPrompt>
    </div>
</template>
