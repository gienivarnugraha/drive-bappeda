// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    // '@nuxtjs/supabase',
    '@vueuse/nuxt'
  ],

  devtools: {
    // enabled:  process.env.NODE_ENV === 'development'
    enabled: false
  },

  routeRules: {
    '/documents/*': { ssr: false },
    '/home': { ssr: false },
    '/settings': { ssr: false },
    '/': { prerender: true },
    '/login': { prerender: true },
    '/api/**': {
      cors: true
    }
  },

  // supabase: {
  //   redirect: process.env.NODE_ENV === 'development' ? false : true,
  //   key: process.env.SUPABASE_PRIVATE_KEY,
  //   url: process.env.SUPABASE_URL
  // },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      storageUrl: process.env.STORAGE_URL
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
