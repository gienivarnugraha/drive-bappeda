// server/api/admin/users.get.ts
import { serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event);

    const { data, error } = await client.auth.admin.listUsers();


    if (error) {
        console.log('error listing user: ', error)
    }

    // @ts-ignore
    const { users, total, lastPage, nextPage } = data

    return { users, pagination: { total, lastPage, nextPage }, error };
});
