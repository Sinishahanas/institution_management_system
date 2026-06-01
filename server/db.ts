import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import * as schema from "../shared/schema";

// import { log } from "./vite";

dotenv.config();

/**
 * @purpose
 *   Creates a PostgreSQL connection pool with configuration from environment variables.
 *   Manages connections efficiently, supports reconnections on certain errors.
 *
 * @params
 *   - user: string (DB username)
 *   - password: string (DB password, default: empty string)
 *   - host: string (DB host)
 *   - port: number (DB port)
 *   - database: string (DB name)
 *   - max: number (maximum pool connections)
 *   - idleTimeoutMillis: number (milliseconds before idle connection is closed)
 *   - connectionTimeoutMillis: number (milliseconds to wait for a new connection)
 *   - ssl: boolean (whether to use SSL)
 * @returns {Pool} PostgreSQL connection pool instance
 * @throws - Connection errors if DB credentials or host are incorrect
 * @sideEffects - Initializes DB connections
 * @example
 *   import { pool } from './db';
 *   pool.query('SELECT NOW()').then(res => console.log(res.rows));
 */
export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? "",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 300000,
  // retryDelay: 1000,
  ssl: false
});

pool.on('error', (err: NodeJS.ErrnoException) => {
  console.log(`Database pool error: ${err}`, "drizzle");
  // Handle pool errors and attempt reconnection
  if (err.code === '57P01') {
    console.log("Attempting to reconnect to database...", "drizzle");
    pool.connect();
  }
});

/**
 * @purpose
 *   Tests whether the PostgreSQL connection pool can connect successfully.
 * 
 * @param {Pool} pool - PostgreSQL connection pool instance
 * @returns {Promise<void>}
 * @throws - Logs an error if connection fails
 * @sideEffects - Attempts a connection to the database
 *
 * @example
 *   pool.connect()
 *     .then(() => console.log("Database connection successful"))
 *     .catch(err => console.error("Database connection error", err));
 */
pool.connect()
  .then(() => console.log("Database connection successful", "drizzle"))
  .catch((err) => console.log(`Database connection error: ${err}`, "drizzle"));

/**
 * @purpose
 *   Creates a Drizzle ORM instance using the PostgreSQL connection pool.
 *   Provides type-safe query builder and access to the defined schema.
 *
 * @params
 *   - pool: Pool (PostgreSQL connection pool)
 *   - schema: object (Drizzle schema object)
 * @returns {object} Drizzle ORM instance
 * @throws None
 * @sideEffects None
 *
 * @example
 *   import { db } from './db';
 *   const students = await db.select().from(schema.students);
 */
export const db = drizzle(pool, { schema });