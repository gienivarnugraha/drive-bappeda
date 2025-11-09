<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, FormError } from '@nuxt/ui'
import { useItems } from '~/composables/useItems'

definePageMeta({
  layout: 'home',
  middleware: 'auth'
})

const { categories, divisions } = await useItems()

const fileRef = useTemplateRef<HTMLInputElement>('fileRef')

const supabase = useSupabaseClient()

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
      .upload('public/avatar1.png', avatarFile, {
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

    profile.avatar = data?.fullPath
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
  display_name: 'Benjamin Canac',
  avatar: undefined,
})
const toast = useToast()

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

}


const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: undefined,
  new: undefined
})

const updateUserPassword = async () => {
  const { data, error } = await supabase.auth.updateUser({
    password: password.new
  })
  if (error) console.log(error)
}

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}
</script>

<template>
  <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto">
    <UForm id="settings" :schema="profileSchema" :state="profile" @submit="profileUpdate">
      <UPageCard title="Profile" description="These informations will be displayed publicly." variant="naked"
        orientation="horizontal" class="mb-4">
        <UButton form="settings" label="Save changes" color="neutral" type="submit" class="w-fit lg:ms-auto" />
      </UPageCard>

      <UPageCard variant="subtle" class="bg-linear-to-tl from-primary/10 from-5% to-default">
        <UFormField name="email" label="Email" description="Used to sign in, for email receipts and product updates."
          required class="flex max-sm:flex-col justify-between items-start gap-4">
          <UInput type="email" disabled />
        </UFormField>
        <USeparator />
        <UFormField name="name" label="Name" description="Will appear on receipts, invoices, and other communication."
          required class="flex max-sm:flex-col justify-between items-start gap-4">
          <UInput v-model="profile.display_name" autocomplete="off" />
        </UFormField>

        <USeparator />
        <UFormField name="avatar" label="Avatar" description="JPG, GIF or PNG. 1MB Max."
          class="flex max-sm:flex-col justify-between sm:items-center gap-4">
          <div class="flex flex-wrap items-center gap-3">
            <UAvatar :src="profile.avatar" :alt="profile.display_name" size="lg" />
            <UButton label="Choose" color="neutral" @click="onFileClick" />
            <input ref="fileRef" type="file" class="hidden" accept=".jpg, .jpeg, .png, .gif" @change="onFileChange">
          </div>
        </UFormField>
      </UPageCard>
    </UForm>

    <UPageCard title="Password" description="Confirm your current password before setting a new one." variant="subtle"
      class="bg-linear-to-tl from-secondary/10 from-5% to-default" @submit="updateUserPassword">
      <UForm :schema="passwordSchema" :state="password" :validate="validate" class="flex flex-col gap-4 max-w-xs">
        <UFormField name="current">
          <UInput v-model="password.current" type="password" placeholder="Current password" class="w-full" />
        </UFormField>

        <UFormField name="new">
          <UInput v-model="password.new" type="password" placeholder="New password" class="w-full" />
        </UFormField>

        <UButton label="Update" class="w-fit" type="submit" />
      </UForm>
    </UPageCard>

    <SettingsItemsEditor :options="categories" title="Kategori" type="categories"
      :additional-fields="{ description: '' }" />

    <SettingsItemsEditor :options="divisions" title="Bidang" type="divisions" :additional-fields="{ icon: '' }" />
  </div>
</template>
