import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from './v3.schema';

export type DbTransaction = PostgresJsDatabase<typeof schema>;
