import { useDrizzle, tables } from '~~/server/utils/drizzle'
// @ts-ignore
import bcrypt from 'bcrypt'
import type { User } from '#shared/types';


export default defineEventHandler(async (event) => {
    const { avatar, name } = await readBody<Pick<User, 'avatar' | 'name'>>(event);

    const session = await getUserSession(event)

    const db = useDrizzle()

    try {
        const user = await db.update(tables.users).set({
            avatar, name
        }).where(eq(tables.users.id, session?.user?.id as string)).returning({
            id: tables.users.id,
            email: tables.users.email,
            name: tables.users.name,
            avatar: tables.users.avatar,
        })

        await replaceUserSession(event, {
            user: {
                id: user[0]?.id,
                email: user[0]?.email,
                name: user[0]?.name,
                avatar: user[0]?.avatar
            },
        })

        return setResponseStatus(event, 201)

    } catch (error: any) {
        console.error('error creating user: ', error)

        throw createError({
            statusCode: 400,
            message: `Error creating user: ${error.message}`
        })
    }
});
