<script setup lang="ts">
// Define data for the Features section
const features = [
  {
    icon: 'i-heroicons-chat-bubble-left-right-20-solid',
    title: 'Instant Responses',
    description: 'Our AI chatbot provides immediate answers to user queries, reducing wait times and improving satisfaction.',
    color: 'primary'
  },
  {
    icon: 'i-heroicons-cog-6-tooth-20-solid',
    title: 'Customizable Workflows',
    description: 'Tailor the chatbot\'s responses and conversational flows to perfectly match your brand and specific needs.',
    color: 'orange'
  },
  {
    icon: 'i-heroicons-chart-bar-20-solid',
    title: 'Actionable Insights',
    description: 'Gain valuable data on user interactions, popular questions, and areas for improvement with built-in analytics.',
    color: 'emerald'
  },
  {
    icon: 'i-heroicons-user-group-20-solid',
    title: '24/7 Availability',
    description: 'Ensure your customers always have support, day or night, without the need for human intervention.',
    color: 'purple'
  }
]

// Define data for the CTA section
const cta = {
  title: 'Ready to Transform Your Customer Support?',
  description: 'Experience the power of AI-driven conversations. Try our chatbot today and see the difference.',
  buttonText: 'Try Our Chatbot Now',
  buttonLink: '#' // Link to your chatbot application or sign-up
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <UContainer>
      <UHeader
        :links="[{ label: 'Features', to: '#features' }, { label: 'Pricing', to: '#' }, { label: 'Contact', to: '#' }]"
      >
        <template #left>
          <Logo />
        </template>
        <template #right>
          <UButton
            label="Login"
            icon="i-heroicons-arrow-right-end-on-rectangle-20-solid"
            color="primary"
            variant="solid"
            to="/login"
          />
        </template>
      </UHeader>
    </UContainer>

    <UMain>
      <UContainer class="py-24 sm:py-32 text-center">
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
            <UButton
              :label="cta.buttonText"
              size="xl"
              color="primary"
              variant="solid"
              icon="i-heroicons-chat-bubble-left-right-20-solid"
              :to="cta.buttonLink"
            />
            <UButton
              label="Learn More"
              size="xl"
              color="secondary"
              variant="ghost"
              icon="i-heroicons-question-mark-circle-20-solid"
              to="#features"
            />
          </div>

          <div
            class="mt-16 relative aspect-video md:aspect-2/1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex items-center justify-center p-8"
          >
            <UIcon
              name="i-heroicons-computer-desktop-20-solid"
              class="text-primary-400 text-9xl absolute inset-0 m-auto opacity-10"
            />
            <div class="relative z-10 text-gray-500 dark:text-gray-400 text-lg">
              <p>Imagine your chatbot interface here!</p>
              <p class="text-sm mt-2">
                Example: a screenshot of a conversation or a stylized icon.
              </p>
              <p class="text-xs mt-1">
                <span class="italic">Placeholder for a compelling visual.</span>
                <span class="font-bold"> Add an image of your chatbot in action!</span>
              </p>
            </div>
          </div>
        </div>
      </UContainer>

      <UContainer id="features" class="py-24 sm:py-32">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Key Features to Elevate Your Business
          </h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover how our AI chatbot empowers your team and delights your customers.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <UCard v-for="(feature, index) in features" :key="index" :ui="{ body: 'flex-grow' }">
            <template #header>
              <UIcon
                :name="feature.icon"
                :class="`w-10 h-10 text-${feature.color}-500 dark:text-${feature.color}-400 mb-2`"
              />
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

      <UContainer class="py-24 sm:py-32 text-center bg-primary-50 dark:bg-primary-950 rounded-lg shadow-lg">
        <h2 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {{ cta.title }}
        </h2>
        <p class="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          {{ cta.description }}
        </p>
        <div class="mt-10">
          <UButton
            :label="cta.buttonText"
            size="xl"
            color="primary"
            variant="solid"
            icon="i-heroicons-sparkles-20-solid"
            :to="cta.buttonLink"
          />
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
        <UButton
          aria-label="Privacy Policy"
          to="#"
          target="_blank"
          color="secondary"
          variant="ghost"
          label="Privacy Policy"
        />
        <UButton
          aria-label="Terms of Service"
          to="#"
          target="_blank"
          color="secondary"
          variant="ghost"
          label="Terms of Service"
        />
      </template>
    </UFooter>
  </div>
</template>

<style scoped>
/* Any custom styles, though Nuxt UI handles most things with Tailwind classes */
</style>
