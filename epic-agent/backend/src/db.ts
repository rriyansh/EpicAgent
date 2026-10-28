import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'epic.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(
`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  provider TEXT NOT NULL DEFAULT 'email',
  google_id TEXT UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dob TEXT,
  accent TEXT NOT NULL DEFAULT '#6366f1',
  wallpaper TEXT NOT NULL DEFAULT 'none',
  font_scale TEXT NOT NULL DEFAULT 'medium',
  voice TEXT NOT NULL DEFAULT 'Sage',
  voice_language TEXT NOT NULL DEFAULT 'en-US',
  speed INTEGER NOT NULL DEFAULT 2,
  pitch TEXT NOT NULL DEFAULT 'medium',
  volume INTEGER NOT NULL DEFAULT 80,
  provider TEXT NOT NULL DEFAULT 'gemini',
  temperature REAL NOT NULL DEFAULT 0.7,
  onboarding_complete INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  key_encrypted TEXT NOT NULL,
  label TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  fails INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  cooldown_until INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  last_used INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_keys_user_provider ON api_keys(user_id, provider, enabled);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  reasoning TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id, created_at);
`);

// Keep existing local databases compatible with the onboarding completion flow.
try { db.exec('ALTER TABLE profiles ADD COLUMN onboarding_complete INTEGER NOT NULL DEFAULT 0'); } catch {}
try { db.exec("ALTER TABLE profiles ADD COLUMN voice_language TEXT NOT NULL DEFAULT 'en-US'"); } catch {}

export default db;
