import { z } from 'zod'
import { createError } from '#imports'
import { useDrizzle } from '#imports'
import { setUserSession } from '#imports'

const invalidCredentialsError = createError({
    statusCode: 401,
    // This message is intentionally vague to prevent user enumeration attacks.
    message: 'Invalid credentials',
})

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
        throw invalidCredentialsError
    }

    if (!(await verifyPassword(user.password, password))) {
        throw invalidCredentialsError
    }

    await setUserSession(event, {
        user: {
            email,
        },
        loggedInAt: Date.now(),
    })

    return setResponseStatus(event, 201)
})
