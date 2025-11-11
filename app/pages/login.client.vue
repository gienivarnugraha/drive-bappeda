<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const toast = useToast()

onMounted(() => {
  const user = useSupabaseUser()

  console.log('user: ', !!user.value)
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

  console.log('logged in: ', data.user?.email)

  if (error) {
    console.error('auth error: ', error);

    // Check if the error message is the specific one you want to act on.
    // NOTE: This check is purely to illustrate how to trap specific errors,
    // but a sign-in error usually just means invalid credentials.
    if (error.message === 'Invalid Refresh Token: Refresh Token not found') {
      console.warn('Handling critical session error: INVALID REFRESH TOKEN. Attempting to clear/re-login.');

      // The best action here is usually to force a complete sign-out
      // and prompt the user to log in again.
      await supabase.auth.signOut();

      toast.add({
        title: 'Session Error',
        description: 'Your session is corrupted. Please log in again.',
        color: 'error'
      });
      // Do NOT navigate to /home on this critical error.
      return;
    }
    // Handle all other sign-in errors (e.g., Invalid credentials)
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error'
    });

    // IMPORTANT: Exit the function immediately on error!
    return;
  } else if (data) {

    navigateTo('/home')

    toast.add({ title: 'Success', description: `Welcome Back ${data.user?.email}!`, color: 'success' })
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
