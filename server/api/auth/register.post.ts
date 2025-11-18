import { z } from 'zod'
import { tables, useDrizzle } from '~~/server/utils/drizzle'

export default defineEventHandler(async (event) => {
    const { email, password, name, avatar } = await readValidatedBody(event, z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(8),
        avatar: z.string().url().optional(),
    }).parse)

    const hashedPassword = await hashPassword(password)

    const db = useDrizzle()

    try {
        const user = await db.insert(tables.users).values({
            email,
            name,
            avatar,
            password: hashedPassword
        }).returning()

        await setUserSession(event, {
            user: {
                id: user[0].id,
                email: user[0].email,
                name: user[0].name,
                avatar: user[0].avatar
            },
            loggedInAt: Date.now(),
        })

        return setResponseStatus(event, 201)
    } catch (error: any) {
        console.error('error creating user: ', error)
        throw createError({
            statusCode: 400,
            message: `Error creating user: ${error.message}`
        })
    }

})
