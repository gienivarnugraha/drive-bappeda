import { useDrizzle, tables } from '#imports';
// @ts-ignore
import bcrypt from 'bcrypt'
import { User } from '~~/server/database/schema';


export default defineEventHandler(async (event) => {
    const { avatar, name } = await readBody<Pick<User, 'avatar' | 'name'>>(event);

    const db = useDrizzle()

    try {
        const response = await db.update(tables.users).set({
            avatar, name
        }).returning();

        console.log('User updated: ', response)

        return {
            message: 'User updated: ',
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
