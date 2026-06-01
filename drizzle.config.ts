import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

/**
 * Drizzle Kit configuration object.
 * This configuration defines how Drizzle Kit should generate and manage database migrations.
 *
 * @constant
 * @type {import('drizzle-kit').Config}
 * @property {string} out - The directory where migration files will be generated.
 * @property {string} schema - The path to the Drizzle ORM schema file.
 * @property {'postgresql'} dialect - The SQL dialect used by the database.
 * @property {object} dbCredentials - Database connection credentials.
 * @property {string} dbCredentials.url - The connection URL for the PostgreSQL database, sourced from environment variables.
 *
 * @example
 * // To generate a new migration:
 * // `drizzle-kit generate:pg`
 */
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
