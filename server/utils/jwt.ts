import { sign, verify } from '@tsndr/cloudflare-worker-jwt'
import { type User } from '#auth-utils'
import { H3Event, appendResponseHeader } from 'h3'
import { parse, parseSetCookie, serialize } from 'cookie-es'


export const getAccessToken = async (payload: User) => {
    const config = useRuntimeConfig()
    // Create a token
    return await sign({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + (2 * (60 * 60)), // +2h
    },
        config.session.password as string
    )
}

export const getRefreshToken = async () => {
    const config = useRuntimeConfig()
    // Create a token
    return await sign({
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    },
        `${config.session.password}-secret` as string
    )
}

export const verifyToken = async (token: string) => {
    const config = useRuntimeConfig()
    // Verify token
    const verifiedToken = await verify(token, config.session.password as string)

    // Abort if token isn't valid
    if (!verifiedToken)
        throw new Error('Invalid token')

    // Access token payload
    return verifiedToken.payload
}


export const refreshToken = async (event: H3Event) => {

    const config = useRuntimeConfig()

    const session = await getUserSession(event)

    if (!session.jwt?.accessToken && !session.jwt?.refreshToken) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized',
        })
    }

    if (!await verify(session.jwt.refreshToken, `${config.session.password!}-secret`)) {
        throw createError({
            statusCode: 401,
            message: 'refresh token is invalid',
        })
    }

    const accessToken = await sign(
        {
            ...session.user,
            exp: Math.floor(Date.now() / 1000) + 30, // 30 seconds
        },
        config.session.password!,
    )

    await setUserSession(event, {
        jwt: {
            accessToken,
            refreshToken: session.jwt.refreshToken,
        },
        loggedInAt: Date.now(),
    })

    if (import.meta.server && event) {
        for (const setCookie of event.headers.getSetCookie()) {
            appendResponseHeader(event, 'Set-Cookie', setCookie)
            // Update session cookie for next fetch requests
            const { name, value } = parseSetCookie(setCookie)
            if (name === config.session.name) {

                console.error('updating headers.cookie to', value)

                const cookies = parse(event.headers.get('cookie') || '')
                // set or overwrite existing cookie
                cookies[name] = value
                // update cookie event header for future requests
                event.headers.set('cookie', Object.entries(cookies).map(([name, value]) => serialize(name, value)).join('; '))
                // Also apply to event.node.req.headers
                if (event.node?.req?.headers) {
                    event.node.req.headers['cookie'] = event.headers.get('cookie') || ''
                }
            }
        }
    }
}