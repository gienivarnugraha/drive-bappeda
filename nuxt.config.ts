// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-auth-utils'
  ],
  alias: {
    "#server/*": "/<rootDir>/server/*"
  },
  devtools: {
    // enabled:  process.env.NODE_ENV === 'development'
    enabled: false
  },

  routeRules: {
    '/': { prerender: true },
    '/login': { prerender: true },
    '/api/**': {
      cors: true
    }
  },

  nitro: {
    storage: {
      public: {
        driver: 'fs',
        base: '/public/'
      },
      'vercel-blobs': {
        driver: 'vercelBlob',
        access: 'public'
      },
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      storageUrl: `${process.env.STORAGE_URL}/documents/`,
      avatarUrl: `${process.env.STORAGE_URL}/avatars/`,
    }
  },

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