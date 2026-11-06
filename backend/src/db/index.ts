import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../config/logger";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  logger.error({ err }, "unexpected pg client error");
  process.exit(-1);
});

export async function connectDb() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    const host = (() => {
      try {
        return new URL(env.DATABASE_URL).host;
      } catch {
        return "configured";
      }
    })();
    logger.info({ host }, "db connected");
  } finally {
    client.release();
  }
}

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug({ duration, rows: res.rowCount }, "db query");
  return res;
}

export default { pool, query, connectDb };
