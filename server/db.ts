// db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires ssl
});

export const db = drizzle(pool, { mode: "postgresql" });
export const raw = sql; // for raw queries if you need them
