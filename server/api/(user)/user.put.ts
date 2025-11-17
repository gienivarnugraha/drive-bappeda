import { useDrizzle, tables } from '#imports';
// @ts-ignore
import bcrypt from 'bcrypt'
import { User } from '#shared/types';


export default defineEventHandler(async (event) => {
    const { avatar, name } = await readBody<Pick<User, 'avatar' | 'name'>>(event);

    const db = useDrizzle()

    try {
        const user = await db.update(tables.users).set({
            avatar, name
        }).returning({
            id: tables.users.id,
            email: tables.users.email,
            name: tables.users.name,
            avatar: tables.users.avatar,
        })

        await replaceUserSession(event, {
            user: {
                id: user[0].id,
                email: user[0].email,
                name: user[0].name,
                avatar: user[0].avatar
            },
        })

        return setResponseStatus(event, 201)

    } catch (error: any) {
        console.log('error creating user: ', error)

        throw createError({
            statusCode: 400,
            message: `Error creating user: ${error.message}`
        })
    }
});
