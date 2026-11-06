import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { Request } from "express";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { query, pool } from "../db";
import { HttpError } from "./httpError";
import { isScope, type Scope } from "./scopes";

let devPepper: string | null = null;

function pepper() {
  if (env.API_KEY_PEPPER) return env.API_KEY_PEPPER;
  if (env.NODE_ENV === "production") {
    throw new HttpError(500, "pepper_missing", "API key pepper is not configured");
  }
  if (!devPepper) {
    devPepper = randomBytes(32).toString("hex");
    logger.warn("API_KEY_PEPPER is missing. Dev keys will stop working after a restart.");
  }
  return devPepper;
}

function digest(token: string) {
  return createHmac("sha256", pepper()).update(token).digest("hex");
}

function sameHash(left: string, right: string) {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function generateApiKey() {
  const secretId = `kid_${randomBytes(9).toString("base64url")}`;
  const secret = randomBytes(32).toString("base64url");
  const token = `ea_live.${secretId}.${secret}`;
  return { secretId, token, hash: digest(token), lastFour: secret.slice(-4), prefix: "ea_live" };
}

export async function createApiKey(input: {
  userId: string;
  name: string;
  scopes: Scope[];
  expiresAt: Date | null;
  rotatedFrom?: string;
}) {
  const material = generateApiKey();
  const created = await query(
    `INSERT INTO api_keys (user_id, name, key_prefix, key_hash, secret_id, scopes, expires_at, status, rotated_from, last_four)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9)
     RETURNING id, name, secret_id, key_prefix, last_four, scopes, status, expires_at, created_at, rotated_from`,
    [
      input.userId,
      input.name,
      material.prefix,
      material.hash,
      material.secretId,
      input.scopes,
      input.expiresAt,
      input.rotatedFrom ?? null,
      material.lastFour,
    ]
  );
  return { secret: material.token, key: created.rows[0] };
}

export async function listApiKeys(userId: string) {
  const result = await query(
    `SELECT id, name, secret_id, key_prefix, last_four, scopes, status, expires_at, last_used_at, created_at, rotated_from, revoked_at
     FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function rotateApiKey(userId: string, keyId: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const current = await client.query(
      `SELECT id, name, scopes, expires_at, status FROM api_keys WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [keyId, userId]
    );
    const row = current.rows[0];
    if (!row || row.status !== "active") throw new HttpError(404, "key_not_found", "Active API key was not found");
    await client.query(`UPDATE api_keys SET status = 'rotated', revoked_at = now() WHERE id = $1`, [keyId]);
    const material = generateApiKey();
    const created = await client.query(
      `INSERT INTO api_keys (user_id, name, key_prefix, key_hash, secret_id, scopes, expires_at, status, rotated_from, last_four)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9)
       RETURNING id, name, secret_id, key_prefix, last_four, scopes, status, expires_at, created_at, rotated_from`,
      [userId, row.name, material.prefix, material.hash, material.secretId, row.scopes, row.expires_at, keyId, material.lastFour]
    );
    await client.query("COMMIT");
    return { secret: material.token, key: created.rows[0], previousId: keyId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function revokeApiKey(userId: string, keyId: string) {
  const result = await query(
    `UPDATE api_keys SET status = 'revoked', revoked_at = now()
     WHERE id = $1 AND user_id = $2 AND status = 'active'
     RETURNING id`,
    [keyId, userId]
  );
  if (!result.rowCount) throw new HttpError(404, "key_not_found", "Active API key was not found");
}

export async function authenticateApiKey(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "ea_live" || !parts[1] || !parts[2]) {
    throw new HttpError(401, "invalid_api_key");
  }
  const computed = digest(token);
  const found = await query(
    `SELECT k.id, k.user_id, k.key_hash, k.scopes, k.status, k.expires_at, u.email
     FROM api_keys k JOIN users u ON u.id = k.user_id
     WHERE k.secret_id = $1`,
    [parts[1]]
  );
  const row = found.rows[0];
  const match = sameHash(computed, row?.key_hash ?? digest("missing-key"));
  const expired = row?.expires_at && new Date(row.expires_at).getTime() <= Date.now();
  if (!row || !match || row.status !== "active" || expired) {
    throw new HttpError(401, "invalid_api_key");
  }
  await query(`UPDATE api_keys SET last_used_at = now() WHERE id = $1`, [row.id]);
  const scopes = Array.isArray(row.scopes) ? row.scopes.filter(isScope) : [];
  return { userId: String(row.user_id), email: String(row.email), keyId: String(row.id), scopes };
}

export function readApiKey(req: Request) {
  const header = req.headers["x-api-key"];
  if (typeof header === "string" && header.startsWith("ea_live.")) return header.trim();
  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer ea_live.")) return authorization.slice(7).trim();
  return null;
}
