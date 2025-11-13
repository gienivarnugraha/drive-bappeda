import { z } from 'zod'
import { createError } from '#imports'
import { useDrizzle } from '#imports'
import { setUserSession } from '#imports'
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

    await setUserSession(event, {
        user: {
            email,
            name: user.name,
            avatar: user.avatar
        },
        loggedInAt: Date.now(),
    })

    return setResponseStatus(event, 201)
})
