import { z } from 'zod'
import { createError } from '#imports'
import { useDrizzle } from '#imports'
import { verifyPassword, setUserSession } from '#imports'


export default defineEventHandler(async (event) => {
    const db = useDrizzle()

    // const user = await db.query.users.findFirst({
    //     where: (users, { eq }) => eq(users.email, email),
    // })



    return setResponseStatus(event, 201)
})
