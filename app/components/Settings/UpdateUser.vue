<script setup lang="ts">
import type { FormSubmitEvent, FormError } from '@nuxt/ui'
import * as z from 'zod'
import { useUser } from '~/composables/useUser'

const toast = useToast()

const supabase = useSupabaseClient()

const { user } = await useUser()

onMounted(() => {
    profile.display_name = user.display_name
    profile.avatar = user.avatar
})

const fileRef = useTemplateRef<HTMLInputElement>('fileRef')

async function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement


    if (!input.files?.length) {
        return
    }

    const avatarFile = input.files[0]

    if (avatarFile) {
        const { data, error } = await supabase
            .storage
            .from('avatars')
            .upload(avatarFile.name, avatarFile, {
                cacheControl: '3600',
                upsert: true
            })

        if (error) {
            console.log('error uploading files', error)

            toast.add({
                title: 'Error',
                description: `Error uploading files: ${error.message}`,
                icon: 'i-lucide-x',
                color: 'error'
            })

            return
        }

        if (data) {
            toast.add({
                title: 'Success',
                description: 'Your avatar has been uploaded.',
                icon: 'i-lucide-check',
                color: 'success'
            })

            profile.avatar = data?.fullPath
        }

    }

}

function onFileClick() {
    fileRef.value?.click()
}

const profileSchema = z.object({
    display_name: z.string().min(3, 'Must be at least 3 characters'),
    avatar: z.string().optional()
})

type ProfileSchema = z.output<typeof profileSchema>

const profile = reactive<Partial<ProfileSchema>>({
    display_name: undefined,
    avatar: undefined,
})

async function profileUpdate(event: FormSubmitEvent<ProfileSchema>) {
    const { data, error } = await supabase.auth.updateUser({
        data: {
            display_name: event.data.display_name,
            avatar: event.data.avatar
        }
    })

    if (data) {
        toast.add({
            title: 'Success',
            description: 'Your settings have been updated.',
            icon: 'i-lucide-check',
            color: 'success'
        })
    }

    if (error) {
        console.log('error updating user', error)

        toast.add({
            title: 'Error',
            description: error.message,
            icon: 'i-lucide-x',
            color: 'error'
        })
    }

}

</script>

<template>
    <UForm id="settings-update-user" :schema="profileSchema" :state="profile" @submit="profileUpdate">
        <UPageCard title="Profile" description="These informations will be displayed publicly." variant="naked"
            orientation="horizontal" class="mb-4">
            <UButton form="settings" label="Save changes" color="neutral" type="submit" class="w-fit lg:ms-auto" />
        </UPageCard>

        <UPageCard variant="subtle" class="bg-linear-to-tl from-primary/10 from-5% to-default">
            <UFormField name="name" label="Name"
                description="Will appear on receipts, invoices, and other communication." required
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="profile.display_name" autocomplete="off" />
            </UFormField>

            <USeparator />
            <UFormField name="avatar" label="Avatar" description="JPG, GIF or PNG. 1MB Max."
                class="flex max-sm:flex-col justify-between sm:items-center gap-4">
                <div class="flex flex-wrap items-center gap-3">
                    <UAvatar :src="profile.avatar" :alt="profile.display_name" size="lg" />
                    <UButton label="Choose" color="neutral" @click="onFileClick" />
                    <input ref="fileRef" type="file" class="hidden" accept=".jpg, .jpeg, .png, .gif"
                        @change="onFileChange">
                </div>
            </UFormField>
        </UPageCard>
    </UForm>
</template>