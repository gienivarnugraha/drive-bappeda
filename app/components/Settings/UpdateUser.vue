<script setup lang="ts">
import type { FormSubmitEvent, FormError } from '@nuxt/ui'
import * as z from 'zod'
import { useUser } from '~/composables/useUser'
import { toKebabCase } from '~/utils'

const toast = useToast()

const supabase = useSupabaseClient()

const { user } = await useUser()

const config = useRuntimeConfig()

const profileSchema = z.object({
    // Use .trim() to handle whitespace from user input
    display_name: z.string().trim().min(3, 'Display name must be at least 3 characters'),
    avatar: z.string().url('Avatar must be a valid URL or an object URL').optional()
});

type ProfileSchema = z.output<typeof profileSchema>

const profile = reactive<Partial<ProfileSchema>>({
    display_name: undefined,
    avatar: undefined,
})

onMounted(() => {
    const userClone = deepClone(user.value)
    profile.display_name = userClone.display_name
    profile.avatar = sanitizeUrl(`${config.public.avatarUrl}/${userClone.avatar  || ''}`)
})

const fileRef = useTemplateRef<HTMLInputElement>('fileRef')

const avatarFile: Ref<File | undefined> = ref(undefined);

const previousObjectUrl: Ref<string | undefined> = ref(undefined);

// --- File Handling Logic ---

/**
 * Handles the change event from a file input element.
 * * @param event The native change event.
 */
function onFileChange(event: Event): void {
    // Cast the event target to HTMLInputElement immediately for type safety
    const input = event.target as HTMLInputElement;

    // Check for files and exit if none
    const file = input.files?.[0];
    if (!file) {
        // Clear state if the file selection was canceled or cleared
        if (profile.avatar && previousObjectUrl.value) {
            URL.revokeObjectURL(previousObjectUrl.value); // Clean up old URL
        }
        profile.avatar = undefined;
        avatarFile.value = undefined;
        previousObjectUrl.value = undefined;
        return;
    }

    // Cleanup previous object URL to avoid memory leaks
    if (previousObjectUrl.value) {
        URL.revokeObjectURL(previousObjectUrl.value);
    }

    // Create the new object URL for immediate preview
    const newObjectUrl = URL.createObjectURL(file);

    // Update the state
    profile.avatar = newObjectUrl;       // Update for preview
    avatarFile.value = file;             // Update for upload
    previousObjectUrl.value = newObjectUrl; // Store for future cleanup
}

async function uploadFile() {

    if (avatarFile.value) {

        const filename = profile.avatar?.match(/[^/]+$/)

        const { data, error } = await supabase
            .storage
            .from('avatars')
            .upload(filename ? filename[0] + '.' + avatarFile.value.name.split('.').pop() : `${user.value.id}.${avatarFile.value.name.split('.').pop()}`, avatarFile.value, {
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
        } else if (data) {
            return data?.fullPath
        }

    }
}

function onFileClick() {
    fileRef.value?.click()
}


async function profileUpdate(event: FormSubmitEvent<ProfileSchema>) {
    const { display_name } = event.data

    const avatar = await uploadFile()

    const { data, error } = await supabase.auth.updateUser({
        data: {
            display_name,
            avatar
        }
    })

    if (data) {

        user.value.avatar = sanitizeUrl(`${avatarUrl}/${data.user?.user_metadata.avatar}`)
        user.value.display_name = data.user?.user_metadata.display_name

        await nextTick()

        toast.add({
            title: 'Success',
            description: 'Your settings have been updated.',
            icon: 'i-lucide-check',
            color: 'success'
        })

        if (previousObjectUrl.value) {
            URL.revokeObjectURL(previousObjectUrl.value);
            previousObjectUrl.value = undefined;
        }

    } else if (error) {
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
            <UButton label="Save changes" color="neutral" type="submit" class="w-fit lg:ms-auto" />
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