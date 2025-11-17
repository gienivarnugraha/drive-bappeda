import { jwtVerify } from 'jose'
import type { H3Event } from 'h3';

export const getUserSession = async (event: H3Event) => {
    if (!process.env.NUXT_AUTH_SESSION) {
        throw createError('set NUXT AUTH SESSION')
    }
    console.log('session called')
    const authHeaderValue = getRequestHeader(event, 'authorization')

    if (typeof authHeaderValue === 'undefined') {
        throw createError({ statusCode: 403, statusMessage: 'You must be logged in!' })
    }

    const [, token] = authHeaderValue.split(`Bearer `)

    if (!token) return

    try {
        const secret = new TextEncoder().encode(process.env.NUXT_AUTH_SESSION)

        const verified: any = await jwtVerify(token, secret)

        console.log('verified:', verified)

        if (!verified) return

        const { payload } = verified

        return payload
    }

    catch (error) {
        console.error('Login failed. Here\'s the raw error:', error)
        throw createError({ statusCode: 403, statusMessage: 'You must be logged in to use this endpoint' })
    }
}