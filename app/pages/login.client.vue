<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { useUser } from '#imports'


const toast = useToast()

onMounted(()=>{
  const user = useSupabaseUser()

  console.log(!!user.value)
  if (!!user.value) {
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
  const supabase = useSupabaseClient()

  const { email, password, } = payload.data

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    console.log(data.user?.email)

    if (error) {
      console.error('auth error: ', error)

      toast.add({ title: 'Error', description: error.message, color: 'error' })
    }

    navigateTo('/home')

    toast.add({ title: 'Success', description: `Welcome Back ${data.user?.email}!`, color: 'success' })
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
