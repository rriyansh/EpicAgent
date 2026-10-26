
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { AuthedRequest } from '../types';
import db from '../db';

const router = Router();

const ProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  dob: z.string().max(20).optional(),
  accent: z.string().max(20).optional(),
  wallpaper: z.string().max(20).optional(),
  font_scale: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  voice: z.string().max(20).optional(),
  speed: z.number().int().min(0).max(4).optional(),
  pitch: z.enum(['low', 'medium', 'high']).optional(),
  volume: z.number().int().min(0).max(100).optional(),
  provider: z.enum(['gemini', 'openai', 'deepseek', 'anthropic']).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

router.get('/', requireAuth, (req: AuthedRequest, res) => {
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user!.id);
  res.json({ profile });
});

router.put('/', requireAuth, (req: AuthedRequest, res) => {
  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid profile data' });
  const data = parsed.data;

  if (data.name !== undefined) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(data.name, req.user!.id);
  }

  const existing = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user!.id) as any;
  if (!existing) {
    db.prepare(`INSERT INTO profiles (user_id, updated_at) VALUES (?, ?)`).run(req.user!.id, Date.now());
  }

  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (k === 'name') continue;
    if (v === undefined) continue;
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (!fields.length) return res.json({ ok: true });

  fields.push('updated_at = ?');
  values.push(Date.now());
  values.push(req.user!.id);
  db.prepare(`UPDATE profiles SET ${fields.join(', ')} WHERE user_id = ?`).run(...values);

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user!.id);
  res.json({ profile });
});

export default router;
