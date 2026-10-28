
import { Router } from 'express';
import os from 'os';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { AuthedRequest } from '../types';
import { listAllowedCommands, runSafeCommand } from '../services/terminal';

const router = Router();

router.get('/info', requireAuth, (req: AuthedRequest, res) => {
  if (req.device?.isMobile) {
    return res.status(403).json({ error: 'System access is only available on desktop devices.' });
  }
  const cpus = os.cpus();
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptime: os.uptime(),
    cpus: { count: cpus.length, model: cpus[0]?.model || 'Unknown' },
    memory: { total: os.totalmem(), free: os.freemem() },
    device: req.device,
  });
});

router.get('/terminal/commands', requireAuth, (req: AuthedRequest, res) => {
  if (req.device?.isMobile) return res.status(403).json({ error: 'Desktop only' });
  res.json({ commands: listAllowedCommands() });
});

const RunSchema = z.object({
  command: z.string().min(1).max(60),
  args: z.array(z.string().max(200)).max(20).default([]),
  confirmed: z.literal(true),
});

router.post('/terminal/run', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    if (req.device?.isMobile) {
      return res.status(403).json({ error: 'Terminal access is only available on desktop devices.' });
    }
    const parsed = RunSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request — confirmation required' });
    }
    const result = await runSafeCommand(parsed.data.command, parsed.data.args);
    res.json(result);
  } catch (e: any) {
    next(e);
  }
});

export default router;