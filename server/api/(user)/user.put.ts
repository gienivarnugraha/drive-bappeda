import { useDrizzle, tables } from '#imports';
// @ts-ignore
import { User } from '#shared/types';
import { getUserSession } from '~~/server/utils/jwt'


export default defineEventHandler(async (event) => {
    const { avatar, name } = await readBody<Pick<User, 'avatar' | 'name'>>(event);

    const db = useDrizzle()

    await getUserSession(event)

    try {
        const user = await db.update(tables.users).set({
            avatar, name
        }).returning({
            id: tables.users.id,
            email: tables.users.email,
            name: tables.users.name,
            avatar: tables.users.avatar,
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
