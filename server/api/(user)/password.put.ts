import { useDrizzle, tables } from '~~/server/utils/drizzle'
// @ts-ignore
import bcrypt from 'bcrypt'
import type { User } from '#shared/types';

export default defineEventHandler(async (event) => {
    const { password } = await readBody<Pick<User, 'password'>>(event);

    const db = useDrizzle(event)

    const userSession = await getUserSession(event)

    //const data = await db.select({ userPassword: tables.users.password }).from(tables.users).where(eq(tables.users.id, userSession?.user?.id as string))
    const data = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userSession?.user?.id as string),
    })

    if (await bcrypt.compare(password, data?.password)) {
        throw createError({
            statusCode: 422,
            message: `New password cannot be the same as the current password`
        })
    }

    const hashedPassword = await bcrypt.hash(password, 2)

    try {
        await db.update(tables.users).set({
            password: hashedPassword
        });

        return setResponseStatus(event, 201)
    } catch (error: any) {
        console.error('error updating password: ', error)

        throw createError({
            statusCode: 400,
            message: `Error updating password: ${error.message}`
        })
    }
});
