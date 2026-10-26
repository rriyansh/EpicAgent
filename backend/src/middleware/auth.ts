
import { Response, NextFunction } from 'express';
import { AuthedRequest } from '../types';
import { verifyAccess } from '../utils/jwt';
import db from '../db';
import { UserRow } from '../types';

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = verifyAccess(token);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub) as UserRow | undefined;
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}