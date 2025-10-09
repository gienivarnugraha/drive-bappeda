<script setup lang="ts">
import type { ChatMessageProps } from '@nuxt/ui'

const input = ref('')

defineProps<{
    collapsed?: boolean
}>()

const messages = ref<ChatMessageProps[]>([
    {
        id: '6045235a-a435-46b8-989d-2df38ca2eb47',
        role: 'user',
        parts: [
            {
                type: 'text',
                text: 'Hello, how are you?'
            }
        ]
    },
    {
        id: '7a92b3c1-d5f8-4e76-b8a9-3c1e5fb2e0d8',
        role: 'assistant',
        parts: [
            {
                type: 'text',
                text: 'I am doing well, thank you for asking! How can I assist you today?'
            }
        ]
    }
])

const handleSubmit = (e: Event) => {
    e.preventDefault()
    //   chat.sendMessage({ text: input.value })
    input.value = ''
}
</script>

<template>
    <div v-if="!collapsed" class="flex flex-col h-full">
        <!-- <UChatMessages :messages="chat.messages" :status="chat.status"> -->
        <UChatMessages :messages="messages">
            <template #content="{ message }">
                {{ message.parts[0].text }}
                <!-- <MDC :value="message" :cache-key="message.id" unwrap="p" /> -->
            </template>
        </UChatMessages>
        <UChatPrompt v-model="input" @submit="handleSubmit">
            <!-- <UChatPrompt v-model="input" :error="chat.error" @submit="handleSubmit"> -->
            <UChatPromptSubmit />
            <!-- <UChatPromptSubmit :status="chat.status" @stop="chat.stop" @reload="chat.regenerate" /> -->
        </UChatPrompt>
    </div>

</template>
