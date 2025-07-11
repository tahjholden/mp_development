import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Allow the application to boot even if a DB connection string isn’t
 * configured.  When `POSTGRES_URL` is absent we export `undefined` for both
 * `client` and `db` so that callers can handle the “no-database” scenario
 * explicitly (e.g. in local development without Postgres).
 */
const connectionString = process.env.POSTGRES_URL;

export const client = connectionString ? postgres(connectionString) : undefined;
export const db = connectionString
  ? drizzle(client as NonNullable<typeof client>, { schema })
  : undefined;
