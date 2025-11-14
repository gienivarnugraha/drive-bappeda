import { useDrizzle, tables } from '#imports';
// @ts-ignore
import bcrypt from 'bcrypt'
import { User } from '~~/server/database/schema';


export default defineEventHandler(async (event) => {
    const payload = await readBody<User>(event);

    const db = useDrizzle()

    const { password, ...rest } = payload

    const hashedPassword = await bcrypt.hash(password, 2)

    try {
        const response = await db.insert(tables.users).values({
            password: hashedPassword,
            ...rest
        }).returning();

        console.log('new user created: ', response)

        return {
            message: 'new user created: ',
            data: response[0]
        }
    } catch (error: any) {
        console.log('error creating user: ', error)

        throw createError({
            statusCode: 400,
            message: `Error creating user: ${error.message}`
        })
    }
});
