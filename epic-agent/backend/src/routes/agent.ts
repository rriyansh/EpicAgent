
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { AuthedRequest, ChatMessage, Provider } from '../types';
import db from '../db';
import { chat, listProviders } from '../services/llm';
import { randomId } from '../utils/crypto';

const router = Router();

const ChatSchema = z.object({
  provider: z.enum(['gemini', 'openai', 'deepseek', 'anthropic']).optional(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(20000),
  })).min(1).max(50),
  model: z.string().max(80).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

router.get('/providers', (_req, res) => {
  res.json({ providers: listProviders() });
});

router.post('/chat', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = ChatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });

    const profile = db.prepare('SELECT provider, temperature FROM profiles WHERE user_id = ?').get(req.user!.id) as any;
    const provider: Provider = parsed.data.provider || (profile?.provider as Provider) || 'gemini';
    const temperature = parsed.data.temperature ?? (profile?.temperature ?? 0.7);

    const result = await chat(
      req.user!.id,
      provider,
      parsed.data.messages as ChatMessage[],
      parsed.data.model,
      temperature
    );

    // Save last user + assistant message
    const lastUser = [...parsed.data.messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      const now = Date.now();
      db.prepare('INSERT INTO messages (id, user_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(randomId(), req.user!.id, 'user', lastUser.content, now);
      db.prepare('INSERT INTO messages (id, user_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(randomId(), req.user!.id, 'assistant', result.text, now + 1);
    }

    res.json({
      text: result.text,
      attempts: result.attempts,
      keyLabel: result.keyLabel,
      provider,
    });
  } catch (e) { next(e); }
});

router.get('/history', requireAuth, (req: AuthedRequest, res) => {
  const rows = db.prepare('SELECT role, content, created_at FROM messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 200').all(req.user!.id);
  res.json({ messages: rows });
});

router.delete('/history', requireAuth, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM messages WHERE user_id = ?').run(req.user!.id);
  res.json({ ok: true });
});

export default router;