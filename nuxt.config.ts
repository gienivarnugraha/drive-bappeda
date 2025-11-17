// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    //'nuxt-auth-utils',
    '@sidebase/nuxt-auth'
  ],
  runtimeConfig: {
    baseURL: '/api/auth'
  },
  auth: {
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'post' },
        signUp: { path: '/register', method: 'post' },
        getSession: { path: '/session', method: 'get' },
      },

      pages: {
        login: '/'
      },
      session: {
        dataType: {
          email: 'string',
          id: 'string',
          name: 'string',
          avatar: 'string'
        },
        dataResponsePointer: '/'
      },
      sessionRefresh: {
        // Whether to refresh the session every time the browser window is refocused.
        enableOnWindowFocus: true,
        // Whether to refresh the session every `X` milliseconds. Set this to `false` to turn it off. The session will only be refreshed if a session already exists.
        enablePeriodically: 30000
      },
      token: {
        signInResponseTokenPointer: '/token/accessToken',
        // cookieDomain: process.env.SITE_URL,
      },
      refresh: {
        signInResponseTokenPointer: '/token/refreshToken',
        // cookieDomain: process.env.SITE_URL,
      }
    }
  },
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