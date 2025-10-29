// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/mdc',
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],

  devtools: {
    enabled: false
  },
  runtimeConfig: {
    public: {
      documentPath: process.env.DOCUMENT_PATH,

    }
  },
  debug: false,

  nitro: {
    storage: {
      documents: {
        driver: "fs",
        base: process.env.DOCUMENT_PATH,
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
