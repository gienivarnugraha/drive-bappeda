// server/api/admin/users.get.ts
import { serverSupabaseServiceRole } from '#supabase/server';

type Schema = {
    id: string
    avatar: string
}

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event);

    const payload = await readBody<Schema>(event);

    const { id } = payload

    // Example: Fetch all users (this bypasses RLS)
    const { data, error } = await client.auth.admin.deleteUser(id)

    if (data.user !== null || data.user !== undefined) {
        console.log('User deleted: ', data.user?.email)
    }

    if (error) {
        console.log('error deleting user: ', error)
    }


    return { data, error };
});
