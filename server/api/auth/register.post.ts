import { z } from 'zod'
import { tables, useDrizzle } from '#imports'

export default defineEventHandler(async (event) => {
    const { email, password, name, avatar } = await readValidatedBody(event, z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(8),
        avatar: z.string().url().optional(),
    }).parse)

    const hashedPassword = await hashPassword(password)

    const db = useDrizzle()

    await db.insert(tables.users).values({
        email,
        name,
        avatar,
        password: hashedPassword
    })

    await setUserSession(event, {
        user: {
            email,
        },
        loggedInAt: Date.now(),
    })

    return setResponseStatus(event, 201)
})
