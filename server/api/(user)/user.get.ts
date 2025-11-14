import { useDrizzle, tables } from "#imports";
import { getTableColumns } from 'drizzle-orm';

// Destructure to exclude the 'content' column
export default defineEventHandler(async (event) => {
    const db = useDrizzle()

    const { password, ...rest } = getTableColumns(tables.users);

    try {
        const data = await db.select(rest).from(tables.users);
        // { users: User[], total: number, nextPage: number, lastPage: number }
        return data;
    } catch (error) {

        console.log('error listing user: ', error)
    }



});
