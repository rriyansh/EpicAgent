
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-access-secret-change-me-please-32');
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-refresh-secret-change-me-please-32');
const JWT_OPTIONS = { issuer: 'epic-agent', audience: 'epic-agent-web', algorithms: ['HS256'] as jwt.Algorithm[] };

function requireSecret(secret: string) { if (secret.length < 32) throw new Error('JWT secrets must be configured securely'); }

export function signAccess(userId: string): string {
  requireSecret(ACCESS_SECRET); return jwt.sign({ sub: userId, type: 'access' } as JwtPayload, ACCESS_SECRET, { ...JWT_OPTIONS, expiresIn: '30m' });
}

export function signRefresh(userId: string): string {
  requireSecret(REFRESH_SECRET); return jwt.sign({ sub: userId, type: 'refresh' } as JwtPayload, REFRESH_SECRET, { ...JWT_OPTIONS, expiresIn: '7d' });
}

export function verifyAccess(token: string): JwtPayload {
  requireSecret(ACCESS_SECRET); const payload = jwt.verify(token, ACCESS_SECRET, JWT_OPTIONS) as JwtPayload;
  if (payload.type !== 'access') throw new Error('wrong token type');
  return payload;
}

export function verifyRefresh(token: string): JwtPayload {
  requireSecret(REFRESH_SECRET); const payload = jwt.verify(token, REFRESH_SECRET, JWT_OPTIONS) as JwtPayload;
  if (payload.type !== 'refresh') throw new Error('wrong token type');
  return payload;
}
