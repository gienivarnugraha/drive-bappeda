// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-auth-utils'
  ],
  devtools: {
    enabled: false
  },
  routeRules: {
    '/': { prerender: true },
    // '/login': { prerender: true },
    // '/api/**': {
    //   cors: true
    // }
  },
  runtimeConfig: {
    PG_DB: '',
    OPENAI_API_KEY: '',
    GOOGLE_API_KEY: '',
    public: {
      SITE_URL: 'http://localhost:3000',
    },
    session: {
      password: '',
    }
  },
  auth: {
  },
  nitro: {
    storage: {
      public: {
        driver: 'fs',
        base: './public/'
      },
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