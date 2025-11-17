import 'dotenv/config'
import { drizzle } from "drizzle-orm/node-postgres";
// @ts-ignore
import { Pool } from 'pg';
export { sql, eq, and, or } from 'drizzle-orm'

import * as schema from '../database/schema'

export const tables = schema
// Create the pg Pool (same configuration as above)
export const pool = new Pool({
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER as string,
    database: process.env.DB_NAME as string,
    password: process.env.DB_PASSWORD as string,
    port: process.env.DB_PORT as unknown as number,
    max: 20, // Max number of clients in the pool (default is 10)
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
});

export function useDrizzle() {
    return drizzle(pool, {
        schema: schema, // Pass your schema object here
        logger: true // Optional: enables logging of SQL queries
    });
}
