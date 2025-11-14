<script setup lang="ts">
// Define data for the Features section

const { loggedIn } = useUserSession()


const features = [
  {
    icon: 'i-lucide-folder',
    title: 'Integrated File Management',
    description: 'Centralize and organize all your regional development documents, reports, and data files securely.',
    color: 'primary'
  },
  {
    icon: 'i-lucide-message-square',
    title: 'Chatbot for PDF Interaction',
    description: 'Instantly get answers and insights by querying your PDF documents through an intelligent chatbot.',
    color: 'emerald'
  },
  {
    icon: 'i-lucide-search',
    title: 'Advanced Data Search',
    description: 'Quickly find specific information across vast datasets with powerful search and filtering capabilities.',
    color: 'orange'
  },
  {
    icon: 'i-lucide-cloud',
    title: 'Secure Data Ingestion',
    description: 'Safely upload and integrate diverse data sources into the datalake for comprehensive analysis.',
    color: 'purple'
  }
]

// Define data for the CTA section
const cta = {
  title: 'Empower Your Regional Development with Data',
  description: 'Unlock the full potential of your BAPPEDA data. Explore our Datalake and Document Chatbot today.',
  buttonText: 'Explore the Datalake',
  buttonLink: '/login' // Link to your datalake application or demo
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <UContainer>
      <UHeader :toggle="false">
        <template #title>
          <div class="flex flex-row space-x-2 items-center">
            <ClientOnly v-if="loggedIn" class="w-fit">
              <UButton variant="subtle" color="neutral" icon="i-lucide-chevron-left" to="/home" />
              <template #fallback>
                <USkeleton class="h-8 w-8" />
              </template>
            </ClientOnly>

            <Logo />
          </div>
        </template>
        <template #right>
          <UColorModeButton />

          <ClientOnly v-if="loggedIn" class="w-fit">
            <UserMenu />
            <template #fallback>
              <USkeleton class="h-8 w-24" />
            </template>
          </ClientOnly>
          <div v-else>
            <UButton label="Login" icon="i-lucide-arrow-right" color="primary" variant="solid" to="/login" />
          </div>
        </template>
      </UHeader>
    </UContainer>

    <UMain>
      <LazyStars />
      <UContainer class="py-16 sm:py-24 text-center ">
        <div class="relative max-w-4xl mx-auto">
          <h1 class="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl leading-tight">
            <span class="text-gray-900 dark:text-white block">Intelligent Conversations,</span>
            <span class="text-primary block">Elevated Experiences.</span>
          </h1>

          <p class="mt-8 text-lg text-gray-600 dark:text-gray-400 sm:text-xl max-w-3xl mx-auto">
            Automate support, engage customers, and scale your business with our advanced AI chatbot
            solution.
          </p>

          <div class="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <UButton :label="cta.buttonText" size="xl" color="primary" variant="solid" icon="i-lucide-message-square"
              :to="cta.buttonLink" />
            <UButton label="Learn More" size="xl" color="secondary" variant="ghost" icon="i-lucide-circle-help"
              to="#features" />
          </div>

          <div
            class="mt-16 relative aspect-video md:aspect-2/1  rounded-lg shadow-xl overflow-hidden flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700">
            <img src="/hero.png" class="text-primary-400 text-9xl absolute inset-0 m-auto object-cover " />
            <!-- <div class="relative z-10 text-gray-500 dark:text-gray-400 text-lg">
              <p>Imagine your chatbot interface here!</p>
              <p class="text-sm mt-2">
                Example: a screenshot of a conversation or a stylized icon.
              </p>
              <p class="text-xs mt-1">
                <span class="italic">Placeholder for a compelling visual.</span>
                <span class="font-bold"> Add an image of your chatbot in action!</span>
              </p>
            </div> -->
          </div>
        </div>
      </UContainer>

      <UContainer id="features" class="py-24 sm:py-32">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Key Features to Elevate Your Analysis
          </h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover how our AI chatbot empowers your team and delights your customers.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <UCard v-for="(feature, index) in features" :key="index" :ui="{ body: 'flex-grow' }">
            <template #header>
              <UIcon :name="feature.icon"
                :class="`w-10 h-10 text-${feature.color}-500 dark:text-${feature.color}-400 mb-2`" />
              <h3 class="mt-2 text-xl font-semibold">
                {{ feature.title }}
              </h3>
            </template>

            <p class="text-gray-500 dark:text-gray-400">
              {{ feature.description }}
            </p>
          </UCard>
        </div>
      </UContainer>

      <UContainer class="py-24 sm:py-32 text-center bg-linear-to-tl from-primary/10 from-5% to-default">
        <h2 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {{ cta.title }}
        </h2>
        <p class="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          {{ cta.description }}
        </p>
        <div class="mt-10">
          <UButton :label="cta.buttonText" size="xl" color="primary" variant="solid" icon="i-lucide-sparkles"
            :to="cta.buttonLink" />
        </div>
      </UContainer>
    </UMain>

    <UFooter class="mt-auto">
      <template #left>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ new Date().getFullYear() }} Chatbot AI. All rights reserved.
        </p>
      </template>

      <template #right>
        <UButton aria-label="Privacy Policy" to="#" target="_blank" color="secondary" variant="ghost"
          label="Privacy Policy" />
        <UButton aria-label="Terms of Service" to="#" target="_blank" color="secondary" variant="ghost"
          label="Terms of Service" />
      </template>
    </UFooter>
  </div>
</template>

<style scoped>
/* Any custom styles, though Nuxt UI handles most things with Tailwind classes */
</style>
