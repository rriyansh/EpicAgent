
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  type: 'access' | 'refresh';
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  provider: 'email' | 'google';
  google_id: string | null;
  created_at: number;
}

export interface ProfileRow {
  user_id: string;
  dob: string | null;
  accent: string;
  wallpaper: string;
  font_scale: string;
  voice: string;
  speed: number;
  pitch: string;
  volume: number;
  provider: string;
  temperature: number;
  updated_at: number;
}

export interface ApiKeyRow {
  id: string;
  user_id: string;
  provider: string;
  key_encrypted: string;
  label: string | null;
  enabled: number;
  fails: number;
  last_error: string | null;
  cooldown_until: number;
  success_count: number;
  last_used: number | null;
  created_at: number;
}

export interface AuthedRequest extends Request {
  user?: { id: string; email: string };
  device?: { isMobile: boolean; os: string; browser: string };
}

export type Provider = 'gemini' | 'openai' | 'deepseek' | 'anthropic';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}