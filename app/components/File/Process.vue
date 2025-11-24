<script setup lang="ts">
import type { StepperItem } from '#ui/types'

const props = defineProps<{ modelValue: number; filesCount: number, isProcessing: boolean }>()

const emits = defineEmits<{
    (e: 'update:modelValue', value: number): void
    (e: 'close'): void
}>()

const successCount = useVModel(props, 'modelValue', emits)

const stepActive = ref(0)

const allSuccess = computed(() => props.filesCount > 0 && successCount.value === props.filesCount)

let eventSource: EventSource | null = null

const isEventSourceClosed = computed(() => eventSource?.readyState !== 2)

const processSteps: Ref<{ message: string, status: string }[]> = ref([])

const stepperItems = ref<StepperItem[]>([
    {
        slot: 'upload' as const,
        title: 'Upload',
        description: 'Uploading your files',
        icon: 'i-lucide-upload'
    },
    {
        slot: 'process' as const,
        title: 'Process',
        description: 'Processing your files',
        icon: 'i-lucide-truck'
    },
    {
        slot: 'done' as const,
        title: 'Done',
        description: 'Use chatbot to ask questions about your documents',
        icon: 'i-lucide-check'
    }
])


const processStepsStyle = (index: number, data: any) => {
    if (index === processSteps.value.length - 1 && data.status === 'info') {
        return {
            icon: 'i-lucide-loader',
            class: 'animate-spin'
        }
    }

    if (data.status === 'error') {
        return {
            icon: 'i-lucide-circle-x',
            class: 'text-error'
        }
    }

    if (data.status === 'success') {
        return {
            icon: 'i-lucide-circle-check',
            class: 'text-primary'
        }
    }

    return {
        icon: 'i-lucide-info',
        class: 'text-primary'
    }
}

onMounted(() => {
    stream()
})

onUnmounted(() => {
    clearProcess()
})



const stream = async () => {

    eventSource = new EventSource('/api/push-notif')

    // Listen for messages from the server
    eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data)

        if (data.status === 'success') {
            successCount.value++

            if (allSuccess.value) {
                stepActive.value = 2
                clearProcess(true)
                toast.add({ title: 'Success', description: `Successfully added ${props.filesCount} file(s) to the data lake.`, color: 'primary' })
                emits('close')
            }
        }

        stepActive.value = 1

        if (!processSteps.value.includes(data)) {
            processSteps.value.push(data)
        }
    }

    // Log connection error
    eventSource.onerror = function (event) {
        clearProcess()

        toast.add({ title: 'Error', description: 'An error occurred with the connection.', color: 'error' })
    }
}

const clearProcess = (isSuccess = false) => {
    if (isSuccess) {
        processSteps.value = []
    }

    if (eventSource) {
        eventSource.close()
    }
    emits('close')
}

const backFromProcess = () => {
    stepActive.value = 0
    processSteps.value = []
    emits('close')
}

const toast = useToast()

</script>

<template>
    <div class="p-4">
        <div v-if="isEventSourceClosed" class="flex mb-4 justify-between items-center">
            <p> Progress </p>

            <UButton icon="i-lucide-arrow-left" label="Back" @click="backFromProcess" />
        </div>

        <UStepper v-if="isProcessing" v-model="stepActive" disabled orientation="vertical" :items="stepperItems"
            class="w-full">
            <template #process>
                <div class="w-full h-48 flex flex-col items-center justify-start pb-4">
                    <div v-for="(step, index) in processSteps" :key="index"
                        class="my-4 w-full flex flex-row items-center justify-start space-x-4">
                        <UIcon :name="processStepsStyle(index, step).icon" :class="processStepsStyle(index, step).class"
                            class="h-4 w-4 flex-none" color=" primary" />
                        <p :class="index === processSteps.length - 1 ? 'font-bold' : 'text-slate-500'"
                            class="flex-1 text-left text-xs">
                            {{ step.message }}
                        </p>
                    </div>
                </div>
            </template>
        </UStepper>

    </div>
</template>