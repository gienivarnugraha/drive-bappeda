import { z } from 'zod'
import { getAccessToken } from '#shared/utils';
// @ts-ignore
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
    const db = useDrizzle()

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
            message: 'Invalid credentials',
        })
    }

    const { accessToken, refreshToken } = await getAccessToken({
        email,
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        loggedInAt: Date.now()
    })


    return {
        token: {
            accessToken,
            refreshToken
        },
    }
})
