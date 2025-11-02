// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt'
  ],

  devtools: {
    // enabled:  process.env.NODE_ENV === 'development'
    enabled: false
  },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      documentPath: process.env.DOCUMENT_PATH
    }
  },

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    storage: {
      documents: {
        driver: 'fs',
        base: process.env.DOCUMENT_PATH
      },
      blobs: {
        driver: 'vercelBlob',
        access: 'public' // Optional, depends on your needs
        // Other Vercel Blob driver options
      }
    }
  },
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
