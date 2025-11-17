import type { JwtData } from '@tsndr/cloudflare-worker-jwt'
import { decode } from '@tsndr/cloudflare-worker-jwt'
import { H3Event } from 'h3'

import { refreshToken as refreshSession } from '~~/server/utils/jwt'

export default defineNuxtRouteMiddleware(async () => {
  const nuxtApp = useNuxtApp()
  // Don't run on client hydration when server rendered
  if (import.meta.client && nuxtApp.isHydrating && nuxtApp.payload.serverRendered) return

  const { session, clear: clearSession, fetch: fetchSession, loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  // Ignore if no tokens
  if (!session.value?.jwt) return

  const serverEvent = useRequestEvent()

  const { accessToken, refreshToken } = session.value.jwt

  const accessPayload = decode(accessToken)
  const refreshPayload = decode(refreshToken)

  // Both tokens expired, clearing session
  if (isExpired(accessPayload) && isExpired(refreshPayload)) {
    console.info('both tokens expired, clearing session')
    await clearSession()
    return navigateTo('/login')
  }
  // Access token expired, refreshing
  else if (isExpired(accessPayload)) {
    console.info('access token expired, refreshing')

    await refreshSession(serverEvent as H3Event)
    // refresh the session
    await fetchSession()
  }
})

function isExpired(payload: JwtData) {
  return payload.payload?.exp && payload.payload.exp < (Date.now() / 1000)
}
