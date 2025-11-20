import jwt from '@tsndr/cloudflare-worker-jwt'

export default eventHandler(async (event) => {
    const session = await getUserSession(event)

    const config = useRuntimeConfig(event)

    if (!session.jwt?.accessToken && !session.jwt?.refreshToken) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized',
        })
    }

    if (!await jwt.verify(session.jwt.refreshToken, `${config.session.password!}-secret`)) {
        throw createError({
            statusCode: 401,
            message: 'refresh token is invalid',
        })
    }

    const accessToken = await jwt.sign(
        {
            hello: 'world',
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

    return {
        accessToken,
        refreshToken: session.jwt.refreshToken,
    }
})
