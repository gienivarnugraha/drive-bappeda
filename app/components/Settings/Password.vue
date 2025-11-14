<script setup lang="ts">
import type { FormSubmitEvent, FormError } from '@nuxt/ui'
import * as z from 'zod'

const toast = useToast()

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: undefined,
  new: undefined
})

const updateUserPassword = async (event: FormSubmitEvent<PasswordSchema>) => {
  const { new: password } = event.data

  try {
    const response = await $fetch('/api/password', {
      method: 'put',
      body: { password }
    })

    toast.add({
      title: 'Success',
      description: 'Your settings have been updated.',
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch (error: any) {
    console.log('error update password: ', error)
    toast.add({
      title: 'Error',
      description: error.message,
      icon: 'i-lucide-x',
      color: 'error'
    })
  }
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

  <UPageCard title="Password" description="Confirm your current password before setting a new one." variant="subtle"
    class="bg-linear-to-tl from-secondary/10 from-5% to-default">

    <UForm id="settings-password" :schema="passwordSchema" :state="password" :validate="validate"
      @submit="updateUserPassword" class="flex flex-col gap-4 max-w-xs">
      <UFormField name="current" label="Current Password">
        <UInput v-model="password.current" type="password" placeholder="Current password" class="w-full" />
      </UFormField>

      <UFormField name="new" label="New Password">
        <UInput v-model="password.new" type="password" placeholder="New password" class="w-full" />
      </UFormField>
      <USeparator />
      <UButton label="Update" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>


</template>