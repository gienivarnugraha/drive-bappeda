import { useDrizzle, tables } from "#imports";
import { getTableColumns } from 'drizzle-orm';

// Destructure to exclude the 'content' column
export default defineEventHandler(async (event) => {
    const db = useDrizzle()

    const { password, ...rest } = getTableColumns(tables.users);

    try {
        const response = await db.select(rest).from(tables.users);

        return response;
    } catch (error) {

        console.log('error listing user: ', error)
    }



});
