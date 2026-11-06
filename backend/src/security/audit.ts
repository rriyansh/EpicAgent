import { createHash } from "crypto";
import type { Request } from "express";
import { query } from "../db";
import { logger } from "../config/logger";

export async function audit(req: Request, action: string, userId?: string, meta: Record<string, unknown> = {}) {
  try {
    await query(
      `INSERT INTO security_events (user_id, action, ip, user_agent, meta) VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [userId ?? null, action, req.ip ?? null, String(req.headers["user-agent"] ?? "").slice(0, 300), JSON.stringify(meta)]
    );
  } catch (err) {
    logger.warn({ err, action }, "audit write failed");
  }
}

export function emailFingerprint(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 16);
}
