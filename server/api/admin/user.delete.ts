import { useDrizzle, tables } from '#imports';
import { eq } from 'drizzle-orm';

type Schema = {
    id: string
    avatar: string
}

export default defineEventHandler(async (event) => {
    const payload = await readBody<Schema>(event);

    const { id } = payload

    const db = useDrizzle()

    try {
        return await db.delete(tables.users).where(eq(tables.users.id, id)).returning()

    } catch (error: any) {
        console.log('error deleting user: ', error)
        throw createError({
            statusCode: 400,
            message: `Error deleting user: ${error.message}`
        })
    }

});
