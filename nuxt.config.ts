// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/mdc',
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],

  devtools: {
    enabled: true
  },
  debug: false,

  nitro: {
    storage: {
      documents: {
        driver: "fs",
        base: process.env.DOCUMENT_PATH,
      },
      blobs: {
        driver: 'vercelBlob',
        access: 'public', // Optional, depends on your needs
        // Other Vercel Blob driver options
      },
    },
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2024-07-11',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
