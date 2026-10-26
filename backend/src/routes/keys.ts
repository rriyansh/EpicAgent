
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { AuthedRequest } from '../types';
import db from '../db';
import { encrypt, maskKey, randomId } from '../utils/crypto';
import { ApiKeyRow } from '../types';

const router = Router();

const AddKeySchema = z.object({
  provider: z.enum(['gemini', 'openai', 'deepseek', 'anthropic']),
  key: z.string().min(8).max(500),
  label: z.string().max(80).optional(),
});

router.get('/', requireAuth, (req: AuthedRequest, res) => {
  const rows = db.prepare('SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.id) as ApiKeyRow[];
  res.json({
    keys: rows.map(r => {
      let masked = '••••';
      try { masked = maskKey(require('../utils/crypto').decrypt(r.key_encrypted)); } catch {}
      return {
        id: r.id,
        provider: r.provider,
        label: r.label || 'Untitled',
        masked,
        enabled: !!r.enabled,
        fails: r.fails,
        last_error: r.last_error,
        cooldown_until: r.cooldown_until,
        success_count: r.success_count,
        last_used: r.last_used,
        created_at: r.created_at,
      };
    }),
  });
});

router.post('/', requireAuth, (req: AuthedRequest, res) => {
  const parsed = AddKeySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid key data' });
  const { provider, key, label } = parsed.data;

  const id = randomId();
  db.prepare(
    `INSERT INTO api_keys (id, user_id, provider, key_encrypted, label, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, req.user!.id, provider, encrypt(key.trim()), label || null, Date.now());

  res.json({ ok: true, id });
});

router.delete('/:id', requireAuth, (req: AuthedRequest, res) => {
  const result = db.prepare('DELETE FROM api_keys WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  res.json({ ok: true, removed: result.changes });
});

router.post('/:id/toggle', requireAuth, (req: AuthedRequest, res) => {
  const row = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as ApiKeyRow | undefined;
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE api_keys SET enabled = ? WHERE id = ?').run(row.enabled ? 0 : 1, row.id);
  res.json({ ok: true, enabled: !row.enabled });
});

router.post('/:id/reset', requireAuth, (req: AuthedRequest, res) => {
  db.prepare(
    'UPDATE api_keys SET fails = 0, cooldown_until = 0, last_error = NULL WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user!.id);
  res.json({ ok: true });
});

router.get('/health', requireAuth, (req: AuthedRequest, res) => {
  const rows = db.prepare('SELECT provider, enabled, cooldown_until FROM api_keys WHERE user_id = ?').all(req.user!.id) as any[];
  const now = Date.now();
  const byProvider: Record<string, { total: number; ready: number }> = {};
  for (const r of rows) {
    byProvider[r.provider] = byProvider[r.provider] || { total: 0, ready: 0 };
    byProvider[r.provider].total++;
    if (r.enabled && r.cooldown_until < now) byProvider[r.provider].ready++;
  }
  res.json({ providers: byProvider });
});

export default router;