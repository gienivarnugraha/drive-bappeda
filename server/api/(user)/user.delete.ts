import { useDrizzle, tables } from '#imports';
import { eq } from 'drizzle-orm';
import { User } from '#shared/types';
import { getUserSession } from '~~/server/utils/jwt'
const deleteAvatar = async (avatar: string) => {
    const storage = useStorage('public')

    try {
        await storage.removeItem(`avatars:${avatar}` as string)

        return { message: `Success Delete avatar: ${avatar}` }

    } catch (error: any) {
        console.error(`error Delete avatar:`, error)

        throw createError({
            statusCode: 400,
            message: `Error Delete avatar:  ${error.message}`
        })

    }
}

export default defineEventHandler(async (event) => {
    const { id, avatar } = await readBody<Pick<User, 'id' | 'avatar'>>(event);

    const userSession = await getUserSession(event)


    if (userSession && (id as unknown as string) === userSession.id) {
        throw createError({
            statusCode: 400,
            message: `Cannot delete current user`
        })
    }

    const db = useDrizzle()

    try {
        await db.delete(tables.users).where(eq(tables.users.id, id as unknown as string))

        if (avatar) {
            await deleteAvatar(avatar)
        }

        return setResponseStatus(event, 201)

    } catch (error: any) {
        console.log('error deleting user: ', error)
        throw createError({
            statusCode: 400,
            message: `Error deleting user: ${error.message}`
        })
    }

});
