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
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PG_DB: process.env.PG_DB,
    STORAGE_KEY: process.env.STORAGE_KEY,
    STORAGE_PATH: process.env.STORAGE_PATH,
    public: {
      SITE_URL: process.env.SITE_URL
    },
    session: {
      password: process.env.NUXT_SESSION_PASSWORD as string
    }
  },
  nitro: {
    storage: {
      'http': {
        driver: 'http',
        base: process.env.STORAGE_URL
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