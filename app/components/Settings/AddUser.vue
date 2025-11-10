<script setup lang="ts">
import type { FormSubmitEvent, FormError } from '@nuxt/ui'
import * as z from 'zod'
import { v4 as uuid } from 'uuid'


const toast = useToast()

const supabase = useSupabaseClient()

const Schema = z.object({
  email: z.string().email('Invalid email'),
  display_name: z.string().min(8, 'Must be at least 8 characters'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  avatar: z.string().optional()
})

type Schema = z.output<typeof Schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  display_name: undefined,
  password: undefined,
  avatar: undefined
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
    if (state.avatar && previousObjectUrl.value) {
      URL.revokeObjectURL(previousObjectUrl.value); // Clean up old URL
    }
    state.avatar = undefined;
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
  state.avatar = newObjectUrl;       // Update for preview
  avatarFile.value = file;             // Update for upload
  previousObjectUrl.value = newObjectUrl; // Store for future cleanup
}

async function uploadFile() {

  if (avatarFile.value) {

    const filename = `${uuid()}.${avatarFile.value.name.split('.').pop()}`

    const { data, error } = await supabase
      .storage
      .from('avatars')
      .upload(filename, avatarFile.value, {
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

  }
}

function onFileClick() {
  fileRef.value?.click()
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const { email, password, display_name } = event.data

  const avatar = await uploadFile()

  const { data, error } = await supabase.auth.signUp(
    {
      email,
      password,
      options: {
        data: {
          display_name,
          avatar,
        },
      },
    }
  )

  if (data) {
    toast.add({
      title: 'Success',
      description: `User ${data.user?.email}} telah ditambahkan!`,
      icon: 'i-lucide-check',
      color: 'success'
    })
  } else if (error) {
    console.log('error adding new user: ', error)

    toast.add({
      title: 'Error',
      description: `Error menambahkan user: ${error.message}`,
      icon: 'i-lucide-x',
      color: 'error'
    })
  }
}

</script>

<template>

  <UPageCard title="Add User" description="Add a new user" variant="subtle"
    class="bg-linear-to-tl from-secondary/10 from-5% to-default">

    <UForm id="settings-add-user" :schema="Schema" :state="state" class="flex flex-col gap-4 " @submit="onSubmit">
      <UFormField name="name" label="Name" description="Will appear on receipts, invoices, and other communication."
        required class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="state.display_name" autocomplete="off" />
      </UFormField>

      <UFormField name="email" label="Email" description="Used to log in." required
        class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="state.email" type="email" autocomplete="off" />
      </UFormField>

      <UFormField name="password" label="Password"
        description="Will appear on receipts, invoices, and other communication." required
        class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="state.password" type="password" placeholder="Password" autocomplete="off" />
      </UFormField>

      <USeparator />
      <UFormField name="avatar" label="Avatar" description="JPG, GIF or PNG. 1MB Max."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar :src="state.avatar" :alt="state.display_name" size="lg" />
          <UButton label="Choose" color="neutral" @click="onFileClick" />
          <input ref="fileRef" type="file" class="hidden" accept=".jpg, .jpeg, .png, .gif" @change="onFileChange">
        </div>
      </UFormField>

      <UButton label="Add" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>


</template>