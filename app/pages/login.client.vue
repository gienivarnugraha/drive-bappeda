<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const toast = useToast()

const { fetch, session } = useUserSession()

onMounted(() => {
  // const session = useSupabaseSession()

  console.log('session: ', !!session)

  if (!!session) {
    navigateTo('/home')
  }
})

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string(),
  // .min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { email, password, } = payload.data

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email,
        password
      }
    })

    await fetch()

    navigateTo('/home')

    toast.add({ title: 'Success', description: `Welcome Back ${email}!`, color: 'success' })

  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error'
    });

  }

}
</script>

<template>
  <div class="flex flex-row h-screen items-center justify-center gap-4 p-4">
    <LazyStars />
    <UPageCard class="w-full max-w-md">
      <UAuthForm :schema="schema" :fields="fields" title="Welcome back!" icon="i-lucide-lock" @submit="onSubmit">
        <template #description>
          Don't have an account? <ULink to="#" class="text-primary font-medium">Sign up</ULink>.
        </template>
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
        </template>
        <template #footer>
          By signing in, you agree to our <ULink to="#" class="text-primary font-medium">Terms of Service
          </ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
