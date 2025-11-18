<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import { v4 as uuid } from 'uuid'
import type { User, FetchResponse } from "#shared/types";

const toast = useToast()

const addView = ref(false)

const { user } = useUserSession()

// --- 1. Zod Schema ---
const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(6, 'Must be at least 6 characters'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  // Avatar is optional in the form, but we'll manage the URL string if uploaded
  avatar: z.string().optional().nullable()
})

type Schema = z.output<typeof schema>

// --- 2. Reactive State ---
const state = reactive<Schema>({
  email: '',
  name: '',
  password: '',
  avatar: null, // Use null for no avatar URL
})

// --- 3. File Handling State & Refs ---
const fileRef = useTemplateRef<HTMLInputElement>('fileRef')
const avatarFile: Ref<File | undefined> = ref(undefined);
const previousObjectUrl: Ref<string | undefined> = ref(undefined);
const isUploading = ref(false);

// --- 4. File Handling Logic ---

/**
 * Handles the change event from a file input element, creating a local object URL for preview.
 * @param event The native change event.
 */
function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  // 4a. Cleanup and reset if file is cleared or canceled
  if (!file) {
    if (previousObjectUrl.value) {
      URL.revokeObjectURL(previousObjectUrl.value);
    }
    state.avatar = null;
    avatarFile.value = undefined;
    previousObjectUrl.value = undefined;
    return;
  }

  // 4b. Cleanup previous object URL to avoid memory leaks
  if (previousObjectUrl.value) {
    URL.revokeObjectURL(previousObjectUrl.value);
  }

  // 4c. Create and store new object URL for preview
  const newObjectUrl = URL.createObjectURL(file);
  state.avatar = newObjectUrl;
  avatarFile.value = file;
  previousObjectUrl.value = newObjectUrl;
}

/**
 * Triggers the hidden file input click.
 */
function onFileClick(): void {
  fileRef.value?.click()
}

// --- 5. Supabase Upload Logic ---

/**
 * Uploads the selected avatar file to Supabase storage.
 * @returns {Promise<string | null>} The public URL of the uploaded file, or null on failure/no file.
 */
async function uploadAvatar(): Promise<string | undefined> {
  if (!avatarFile.value) {
    return undefined; // No file to upload
  }

  isUploading.value = true;
  const file = avatarFile.value;
  // Generate a unique filename using UUID and the original extension
  const fileExtension = file.name.split('.').pop();
  const filename = `${uuid()}.${fileExtension}`;

  const formData = new FormData()

  formData.append('file', file, filename)

  try {
    const { data } = await $fetch('/api/avatar', {
      method: 'post',
      body: formData,
    })

    return data.filename
  } catch (error: any) {
    console.error('error uploading files', error)

    toast.add({
      title: 'Error',
      description: `Error uploading files: ${error.message}`,
      icon: 'i-lucide-x',
      color: 'error'
    })

  } finally {
    isUploading.value = false;

  }

}

// --- 6. Form Submission Logic ---

const onSubmit = async (event: FormSubmitEvent<Schema>): Promise<void> => {
  const { email, password, name } = event.data

  // 6a. Upload the avatar and get its public URL
  const avatarUrl = await uploadAvatar();

  if (avatarFile.value && !avatarUrl) {
    // Stop sign-up if upload failed but a file was selected
    return;
  }

  try {
    const response = await $fetch<FetchResponse<User>>('/api/user', {
      method: 'POST',
      body: {
        email,
        password,
        name,
        avatar: avatarUrl,
      }
    })

    toast.add({
      title: 'Success',
      description: `User ${response.data?.email} has been added!`,
      icon: 'i-lucide-check',
      color: 'success'
    });

    // Optional: Clear form state after successful submission
    Object.assign(state, {
      email: '',
      name: '',
      password: '',
      avatar: null,
    });
    avatarFile.value = undefined;
    if (previousObjectUrl.value) {
      URL.revokeObjectURL(previousObjectUrl.value);
      previousObjectUrl.value = undefined;
    }

  } catch (error: any) {
    console.error('Error adding new user: ', error);
    toast.add({
      title: 'Error',
      description: `Error adding user: ${error.message}`,
      icon: 'i-lucide-x',
      color: 'error'
    });
  }

}
</script>

<template>

  <UPageCard title="Add User" description="Add a new user" variant="subtle"
    class="bg-linear-to-tl from-secondary/10 from-5% to-default">

    <UButton variant="subtle" label="Tambah User" color="primary" size="xs" class="max-w-fit"
      :icon="addView ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" @click="addView = !addView" />

    <UForm v-if="addView" id="settings-add-user" :schema="schema" :state="state" class="flex flex-col gap-4 "
      @submit="onSubmit">
      <UFormField name="name" label="Name" description="The user's display name." required
        class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="state.name" autocomplete="off" />
      </UFormField>

      <UFormField name="email" label="Email" description="Used to log in." required
        class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="state.email" type="email" autocomplete="off" />
      </UFormField>

      <UFormField name="password" label="Password" description="Must be at least 8 characters long." required
        class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="state.password" type="password" placeholder="Password" autocomplete="off" />
      </UFormField>

      <USeparator />

      <UFormField name="avatar" label="Avatar" description="JPG, GIF or PNG. 1MB Max."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar :src="state.avatar ?? undefined" :alt="state.name" size="lg" />
          <UButton :label="avatarFile ? 'Change File' : 'Choose File'" :loading="isUploading" color="neutral"
            @click="onFileClick" />
          <input ref="fileRef" type="file" class="hidden" accept=".jpg, .jpeg, .png, .gif" @change="onFileChange">

          <UButton v-if="avatarFile" icon="i-lucide-x" color="error" variant="ghost"
            @click="onFileChange({ target: { files: null } } as unknown as Event)" />

        </div>
      </UFormField>

      <UButton label="Add User" class="w-fit" type="submit" :loading="isUploading" />
    </UForm>
  </UPageCard>
</template>