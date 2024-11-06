import { defineConfig } from "drizzle-kit"
import { env } from '@/lib/env';


export default defineConfig({
  schema: './db/v3.schema.ts',
  schemaFilter: ['v3'],
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL
  }
});