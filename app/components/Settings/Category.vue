<script setup lang="ts">
import type { Category } from '~/types'
import { z } from 'zod'


const { categories } = await useItems()

const toast = useToast()

const schema = z.object({
    name: z.string().min(2, 'Too short'),
    description: z.string().optional()
})
type Schema = z.output<typeof schema>

const state = reactive<Schema>({
    name: '',
    description: '',
})

const addView = ref(false)

const submit = async (item: Schema, shouldDelete = false) => {
    const { data, message } = await $fetch<{ message: string, data: Category }>('/api/categories', {
        method: 'POST',
        body: {
            shouldDelete,
            ...item
        }
    })
    console.log(data)

    if (shouldDelete) {
        let index = categories.value.findIndex((category: Category) => category.id === data.id)

        console.log(index)

        if (index !== -1) {
            categories.value.splice(index, 1)
        }

    } else {
        categories.value.push(data)
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
    <UPageCard title="Categories" description="Edit categories." variant="subtle">
        <div class="flex flex-row space-x-2 space-y-2 flex-wrap ">
            <div v-for="category in categories" :key="category.id"
                class="flex flex-row space-x-4 rounded-lg border border-primary pl-4 pr-2 py-1">
                <p> {{ category.name }}</p>

                <UTooltip :text="`Hapus ${category.name}`">
                    <UButton color="error" variant="ghost" size="sm" icon="i-lucide-trash"
                        @click="submit(category, true)" />
                </UTooltip>
            </div>
        </div>

        <UTooltip text="Tambah Kategori">
            <UButton variant="subtle" label="Tambah Kategori" color="primary" size="sm"
                :icon="addView ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" @click="addView = !addView" />
        </UTooltip>

        <UForm v-if="addView" :schema="schema" :state="state" class="flex flex-col gap-4 max-w-md "
            @submit="submit(state)">

            <UFormField name="name" label="Name" description="Nama Kategori"
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="state.name" placeholder="New Category Name" class="w-full" />
            </UFormField>

            <UFormField name="description" label="Description" description="Deskripsi Kategori"
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UTextarea :rows="2" v-model="state.description" placeholder="Description of category" class="w-full" />
            </UFormField>

            <UButton label="Add" class="w-fit" type="submit" />
        </UForm>
    </UPageCard>
</template>
