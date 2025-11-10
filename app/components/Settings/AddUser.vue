<script setup lang="ts">
import type { FormSubmitEvent, FormError } from '@nuxt/ui'
import * as z from 'zod'

const toast = useToast()


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

      state.avatar = data?.fullPath
    }

  }

}

function onFileClick() {
  fileRef.value?.click()
}

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


const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const supabase = useSupabaseClient()

  const { email, password, avatar, display_name } = event.data

  console.log(event.data)

  const { data, error } = await supabase.auth.signUp(
    {
      email,
      password,
      options: {
        data: {
          display_name,
          avatar,
        }
      }
    }
  )

  if (data) {
    console.log(data)

    toast.add({
      title: 'Success',
      description: `User baru telah ditambahkan!`,
      icon: 'i-lucide-check',
      color: 'success'
    })
  }

  if (error) {
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