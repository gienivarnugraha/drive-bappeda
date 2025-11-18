import { z } from 'zod'
import { createError } from '#imports'
import { useDrizzle } from '~~/server/utils/drizzle'
import { setUserSession } from '#imports'
import { getRefreshToken, getAccessToken } from '~~/server/utils/jwt'
// @ts-ignore
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
    const db = useDrizzle(event)

    const { email, password } = await readValidatedBody(event, z.object({
        email: z.string().email(),
        password: z.string().min(8),
    }).parse)

    const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
    })

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'User not Found!',
        })
    }

    if (!(await bcrypt.compare(password, user.password))) {
        throw createError({
            statusCode: 401,
            message: 'Wrong password!',
        })
    }

    const { password: notUsed, ...payload } = user

    await setUserSession(event, {
        user: payload,
        loggedInAt: Date.now(),
        jwt: {
            accessToken: await getAccessToken(event, payload),
            refreshToken: await getRefreshToken(event)
        }
    })

    return setResponseStatus(event, 201)
})
