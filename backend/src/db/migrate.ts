import { readFile } from "fs/promises";
import { join } from "path";
import { pool } from "./index";
import { logger } from "../config/logger";

async function runMigrations() {
  const schemaPath = join(__dirname, "schema.sql");
  const sql = await readFile(schemaPath, "utf8");

  const client = await pool.connect();
  try {
    await client.query(sql);
    logger.info("migrations applied successfully");
  } catch (err) {
    logger.error({ err }, "migration failed");
    throw err;
  } finally {
    client.release();
  }
}

runMigrations();
