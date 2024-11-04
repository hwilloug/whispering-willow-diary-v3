import { defineConfig } from "drizzle-kit"
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: './db/v3.schema.ts',
  schemaFilter: ['v3'],
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_DATABASE!,
    ssl: true
  }
});