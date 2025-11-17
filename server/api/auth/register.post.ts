import { z } from 'zod'
import { tables, useDrizzle } from '~~/server/utils/drizzle'
// @ts-ignore
import bcrypt from 'bcrypt'
import { getAccessToken } from '#shared/utils';
import { getUserSession } from '~~/server/utils/jwt'

export default defineEventHandler(async (event) => {
    await getUserSession(event)

    const { email, password, name, avatar } = await readValidatedBody(event, z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(8),
        avatar: z.string().url().optional(),
    }).parse)

    const hashedPassword = await bcrypt.hash(password)

    const db = useDrizzle()

    const user = await db.insert(tables.users).values({
        email,
        name,
        avatar,
        password: hashedPassword
    }).returning()

    const { accessToken, refreshToken } = await getAccessToken({
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        avatar: user[0].avatar,
        createdAt: user[0].createdAt,
        loggedInAt: Date.now()
    })

    return {
        token: {
            accessToken,
            refreshToken
        },
    }
})
