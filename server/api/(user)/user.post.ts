import { useDrizzle, tables } from '~~/server/utils/drizzle'
// @ts-ignore
import bcrypt from 'bcrypt'
import type { User } from '#shared/types';


export default defineEventHandler(async (event) => {
    const payload = await readBody<User>(event);

    const db = useDrizzle(event)

    const { password, ...rest } = payload

    const hashedPassword = await bcrypt.hash(password, 2)

    try {
        await db.insert(tables.users).values({
            password: hashedPassword,
            ...rest
        });

        return setResponseStatus(event, 201)

    } catch (error: any) {
        console.error('error creating user: ', error)

        throw createError({
            statusCode: 400,
            message: `Error creating user: ${error.message}`
        })
    }
});
