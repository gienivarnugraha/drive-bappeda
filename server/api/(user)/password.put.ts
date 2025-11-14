import { useDrizzle, tables } from '#imports';
// @ts-ignore
import bcrypt from 'bcrypt'
import { User } from '~~/server/database/schema';

export default defineEventHandler(async (event) => {
    const { password } = await readBody<Pick<User, 'password'>>(event);

    const db = useDrizzle()

    const userSession = await getUserSession(event)

    const data = await db.select({ userPassword: tables.users.password }).from(tables.users).where(eq(tables.users.id, userSession?.user?.id as string))

    if (await bcrypt.compare(password, data[0].userPassword)) {
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
        console.log('error updating password: ', error)

        throw createError({
            statusCode: 400,
            message: `Error updating password: ${error.message}`
        })
    }
});
