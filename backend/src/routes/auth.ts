
import { Router, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '../db';
import { randomId } from '../utils/crypto';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt';
import { UserRow } from '../types';
import { requireAuth } from '../middleware/auth';
import { AuthedRequest } from '../types';

const router = Router();
const oauthStateCookie = 'epic_google_oauth_state';

function frontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function oauthError(res: Response, error: string) {
  return res.redirect(`${frontendUrl()}/login?error=${encodeURIComponent(error)}`);
}

const RegisterSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(80).optional(),
});

const LoginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

router.post('/register', async (req, res, next) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const { email, password, name } = parsed.data;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const id = randomId();
    const hash = await bcrypt.hash(password, 12);
    const now = Date.now();

    db.prepare(
      'INSERT INTO users (id, email, name, password_hash, provider, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, email.toLowerCase(), name || null, hash, 'email', now);

    db.prepare(
      `INSERT INTO profiles (user_id, updated_at) VALUES (?, ?)`
    ).run(id, now);

    return res.json({
      access: signAccess(id),
      refresh: signRefresh(id),
      user: { id, email: email.toLowerCase(), name: name || null },
      needsOnboarding: true,
    });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const { email, password } = parsed.data;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as UserRow | undefined;
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const profile = db.prepare('SELECT onboarding_complete FROM profiles WHERE user_id = ?').get(user.id) as { onboarding_complete: number } | undefined;
    const needsOnboarding = !profile || !profile.onboarding_complete;

    return res.json({
      access: signAccess(user.id),
      refresh: signRefresh(user.id),
      user: { id: user.id, email: user.email, name: user.name },
      needsOnboarding,
    });
  } catch (e) { next(e); }
});

router.post('/refresh', (req, res) => {
  const { refresh } = req.body || {};
  if (!refresh) return res.status(400).json({ error: 'Missing refresh token' });
  try {
    const payload = verifyRefresh(refresh);
    return res.json({ access: signAccess(payload.sub) });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.get('/me', requireAuth, (req: AuthedRequest, res: Response) => {
  const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.user!.id);
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user!.id);
  res.json({ user, profile });
});

router.post('/logout', (_req, res) => res.json({ ok: true }));

/* Google OAuth — manual implementation without passport */
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }
  const state = crypto.randomBytes(32).toString('base64url');
  res.cookie(oauthStateCookie, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000,
    path: '/api/auth/google',
  });
  const url =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state,
    }).toString();
  res.redirect(url);
});

router.get('/google/callback', async (req, res, next) => {
  try {
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const expectedState = req.cookies?.[oauthStateCookie];
    res.clearCookie(oauthStateCookie, { path: '/api/auth/google' });
    if (!state || !expectedState || state.length !== expectedState.length || !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))) {
      return oauthError(res, 'google_state_invalid');
    }

    const code = String(req.query.code || '');
    if (!code) return oauthError(res, 'google_denied');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }).toString(),
    });
    const tokens: any = await tokenRes.json();
    if (!tokens.access_token) throw new Error('Google token exchange failed');

    const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const info: any = await infoRes.json();
    if (!info.email || !info.sub) throw new Error('Invalid Google profile');

    let user = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').get(info.sub, info.email) as UserRow | undefined;
    if (!user) {
      const id = randomId();
      const now = Date.now();
      db.prepare(
        'INSERT INTO users (id, email, name, provider, google_id, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(id, info.email.toLowerCase(), info.name || null, 'google', info.sub, now);
      db.prepare(`INSERT INTO profiles (user_id, updated_at) VALUES (?, ?)`).run(id, now);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
    }

    const profile = db.prepare('SELECT onboarding_complete FROM profiles WHERE user_id = ?').get(user.id) as { onboarding_complete: number } | undefined;
    const needsOnboarding = !profile || !profile.onboarding_complete;

    const params = new URLSearchParams({
      access: signAccess(user.id),
      refresh: signRefresh(user.id),
      needsOnboarding: String(needsOnboarding),
    });
    // Fragments are not sent to the frontend server, so tokens stay out of server logs and Referer headers.
    res.redirect(`${frontendUrl()}/login#${params.toString()}`);
  } catch (e) { next(e); }
});

export default router;
