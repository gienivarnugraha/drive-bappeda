import 'dotenv/config'
import { drizzle } from "drizzle-orm/node-postgres";
// @ts-ignore
import { Pool } from 'pg';
export { sql, eq, and, or } from 'drizzle-orm'
import { H3Event } from 'h3'

import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle() {
    const config = useRuntimeConfig()
    // Create the pg Pool (same configuration as above)
    const pool = new Pool({
        connectionString: config.PG_DB,
        max: 20, // Max number of clients in the pool (default is 10)
        idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    });

    return drizzle(pool, {
        schema: schema, // Pass your schema object here
        logger: true // Optional: enables logging of SQL queries
    });
}
