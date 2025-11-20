// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    // '@nuxt/image'
  ],
  devtools: {
    enabled: false
  },
  routeRules: {
    '/': { prerender: true },
    '/login': { prerender: true },
    '/api/**': {
      cors: true
    }
  },
  runtimeConfig: {
    public: {
      SITE_URL: process.env.SITE_URL
    },
  },
  nitro: {
    storage: {
      'storage': {
        driver: 'fs-lite',
        base: process.env.STORAGE_PATH
      },
      'blobs': {
        driver: 'vercel-blob',
        access: 'public'
      }
    }
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-07-11',
  debug: false,
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})