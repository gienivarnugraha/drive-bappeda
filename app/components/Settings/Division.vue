<script setup lang="ts">
import type { Division } from '~/types'
import { z } from 'zod'


const { divisions } = await useItems()

const toast = useToast()

const schema = z.object({
    name: z.string().min(2, 'Too short'),
    description: z.string().optional(),
    icon: z.string().optional(),
})
type Schema = z.output<typeof schema>

const state = reactive<Schema>({
    name: '',
    description: '',
    icon: ''
})

const addView = ref(false)

const divisionSubmit = async (item: Schema, shouldDelete = false) => {
    const { data, message } = await $fetch<{ message: string, data: Division }>('/api/divisions', {
        method: 'POST',
        body: {
            shouldDelete,
            ...item
        }
    })
    console.log(data)

    if (shouldDelete) {
        let index = divisions.value.findIndex((division: Division) => division.id === data.id)

        console.log(index)

        if (index !== -1) {
            divisions.value.splice(index, 1)
        }

    } else {
        divisions.value.push(data)
    }

    toast.add({
        title: 'Success',
        description: message,
        icon: 'i-lucide-check',
        color: 'success'
    })

}


</script>

<template>
    <UPageCard title="divisions" description="Edit divisions." variant="subtle">
        <div class="flex flex-row space-x-2 space-y-2 flex-wrap ">
            <div v-for="division in divisions" :key="division.id"
                class="flex flex-row space-x-4 rounded-lg border border-primary pl-4 pr-2 py-1">
                <p> {{ division.name }}</p>

                <UTooltip :text="`Hapus ${division.name}`">
                    <UButton color="error" variant="ghost" size="sm" icon="i-lucide-trash"
                        @click="divisionSubmit(division, true)" />
                </UTooltip>
            </div>
        </div>

        <UTooltip text="Tambah Bidang">
            <UButton variant="subtle" label="Tambah Bidang" color="primary" size="sm"
                :icon="addView ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" @click="addView = !addView" />
        </UTooltip>

        <UForm v-if="addView" :schema="schema" :state="state" class="flex flex-col gap-4 max-w-md "
            @submit="divisionSubmit(state)">

            <UFormField name="name" label="Name" description="Nama Bidang"
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="state.name" placeholder="New Division Name" class="w-full" />
            </UFormField>

            <UFormField name="description" label="Description" description="Deskripsi Bidang"
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UTextarea :rows="2" v-model="state.description" placeholder="Description of division" class="w-full" />
            </UFormField>

            <UButton label="Add" class="w-fit" type="submit" />
        </UForm>
    </UPageCard>
</template>
