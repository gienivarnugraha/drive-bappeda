import { useDrizzle, tables } from '#imports';
// @ts-ignore
import bcrypt from 'bcrypt'
import { User } from '~~/server/database/schema';

export default defineEventHandler(async (event) => {
    const password = await readBody<Pick<User, 'password'>>(event);

    const user = await getUserSession(event)

    const db = useDrizzle()

    if (await bcrypt.compare(password, user.password)) {
        throw createError({
            statusCode: 400,
            message: `New password cannot be the same as the current password`
        })
    }

    const hashedPassword = await bcrypt.hash(password, 2)

    try {
        const data = await db.update(tables.users).set({
            password: hashedPassword
        }).returning();

        console.log('password updated: ', data[0])

        return setResponseStatus(event, 201)
    } catch (error: any) {
        console.log('error updateing password: ', error)

        throw createError({
            statusCode: 400,
            message: `Error updateing password: ${error.message}`
        })
    }
});
