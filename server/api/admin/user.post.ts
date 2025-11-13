import { useDrizzle, tables } from '#imports';
// @ts-ignore
import bcrypt from 'bcrypt'

type Schema = {
    email: string
    name: string
    password: string
    avatar: string
}

export default defineEventHandler(async (event) => {
    const payload = await readBody<Schema>(event);

    const db = useDrizzle()

    const { password, ...rest } = payload

    const hashedPassword = await bcrypt.hash(password, 2)

    try {
        const data = await db.insert(tables.users).values({
            password: hashedPassword,
            ...rest
        }).returning();

        console.log('new user created: ', data)

        return data
    } catch (error: any) {
        console.log('error creating user: ', error)

        throw createError({
            statusCode: 400,
            message: `Error creating user: ${error.message}`
        })
    }
});
