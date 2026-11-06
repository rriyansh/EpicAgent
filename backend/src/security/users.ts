import { randomBytes } from "crypto";
import { query } from "../db";
import { HttpError } from "./httpError";

export async function linkSupabaseUser(supabaseId: string, email: string) {
  const existing = await query(
    `SELECT id, email, supabase_id FROM users WHERE supabase_id = $1 OR email = $2 LIMIT 2`,
    [supabaseId, email]
  );
  const bySupabase = existing.rows.find((row) => row.supabase_id === supabaseId);
  if (bySupabase) {
    if (email && bySupabase.email !== email) {
      try {
        await query(`UPDATE users SET email = $2 WHERE id = $1`, [bySupabase.id, email]);
      } catch {
        email = String(bySupabase.email);
      }
    }
    return { id: String(bySupabase.id), email: email || String(bySupabase.email) };
  }

  const byEmail = existing.rows.find((row) => row.email === email);
  if (byEmail) {
    if (byEmail.supabase_id && byEmail.supabase_id !== supabaseId) {
      throw new HttpError(409, "account_conflict", "This email is already linked to another identity");
    }
    const linked = await query(`UPDATE users SET supabase_id = $2 WHERE id = $1 RETURNING id, email`, [byEmail.id, supabaseId]);
    return { id: String(linked.rows[0].id), email: String(linked.rows[0].email) };
  }

  const created = await query(
    `INSERT INTO users (email, password_hash, supabase_id) VALUES ($1, $2, $3) RETURNING id, email`,
    [email, `disabled:${randomBytes(32).toString("hex")}`, supabaseId]
  );
  return { id: String(created.rows[0].id), email: String(created.rows[0].email) };
}
