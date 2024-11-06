import { defineConfig } from "drizzle-kit"
import { env } from '@/lib/env';


export default defineConfig({
  schema: './db/v3.schema.ts',
  schemaFilter: ['v3'],
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: env.DATABASE_URL,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_DATABASE,
    port: 5432,
    ssl: true
  }
});