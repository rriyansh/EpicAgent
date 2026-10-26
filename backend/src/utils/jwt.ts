
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me-please-32';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me-please-32';

export function signAccess(userId: string): string {
  return jwt.sign({ sub: userId, type: 'access' } as JwtPayload, ACCESS_SECRET, { expiresIn: '30m' });
}

export function signRefresh(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' } as JwtPayload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccess(token: string): JwtPayload {
  const payload = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  if (payload.type !== 'access') throw new Error('wrong token type');
  return payload;
}

export function verifyRefresh(token: string): JwtPayload {
  const payload = jwt.verify(token, REFRESH_SECRET) as JwtPayload;
  if (payload.type !== 'refresh') throw new Error('wrong token type');
  return payload;
}