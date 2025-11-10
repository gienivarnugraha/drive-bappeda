// server/api/admin/users.get.ts
import { serverSupabaseServiceRole } from '#supabase/server';

type Schema = {
    email: string
    display_name: string
    password: string
    avatar: string
}

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event);

    const payload = await readBody<Schema>(event);

    const { email, password, ...rest } = payload

    console.log(payload);

    // Example: Fetch all users (this bypasses RLS)
    const { data, error } = await client.auth.admin.createUser({
        email,
        password,
        user_metadata: {
            ...rest
        }
    });

    if (data.user !== null || data.user !== undefined) {
        console.log('new user created: ', data)

    }

    if (error) {
        console.log('error creating user: ', error)
    }


    return { data, error };
});
