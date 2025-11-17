import { useDrizzle, tables } from '#imports';
// @ts-ignore
import bcrypt from 'bcrypt'
import { set } from 'date-fns';
import { User } from '#shared/types';


export default defineEventHandler(async (event) => {
    const payload = await readBody<User>(event);

    const db = useDrizzle()

    const { password, ...rest } = payload

    console.log(payload)


    const hashedPassword = await bcrypt.hash(password, 2)

    try {
        await db.insert(tables.users).values({
            password: hashedPassword,
            ...rest
        });

        return setResponseStatus(event, 201)

    } catch (error: any) {
        console.log('error creating user: ', error)

        throw createError({
            statusCode: 400,
            message: `Error creating user: ${error.message}`
        })
    }
});
