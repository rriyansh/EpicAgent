/* Epic Agent Backend — multi-key rotation */
require('dotenv').config?.();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const KEYS_FILE = path.join(__dirname, 'keys.json');
const COOLDOWN_MS = parseInt(process.env.COOLDOWN_MS || '60000', 10);
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10);

/* =========================================================
   KEY STORE
   ========================================================= */
let keyStore = { keys: [] };

function loadKeys() {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      keyStore = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
      if (!Array.isArray(keyStore.keys)) keyStore.keys = [];
    }
  } catch (e) { console.error('[keys] load failed:', e.message); }
}
function saveKeys() {
  try { fs.writeFileSync(KEYS_FILE, JSON.stringify(keyStore, null, 2)); }
  catch (e) { console.error('[keys] save failed:', e.message); }
}
loadKeys();

const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const maskKey = (k) => !k ? '' : k.length <= 8 ? '••••' : k.slice(0, 4) + '••••' + k.slice(-4);

/* =========================================================
   ROTATION
   ========================================================= */
function availableKeys(provider) {
  const now = Date.now();
  return keyStore.keys.filter(k =>
    k.provider === provider &&
    k.enabled &&
    (!k.health?.cooldownUntil || k.health.cooldownUntil < now)
  );
}

function pickKey(provider) {
  const pool = availableKeys(provider);
  if (pool.length) {
    // least failures first, then oldest used
    pool.sort((a, b) =>
      (a.health?.fails || 0) - (b.health?.fails || 0) ||
      ((a.health?.lastUsed || 0) - (b.health?.lastUsed || 0))
    );
    return pool[0];
  }
  // all cooling down: pick soonest
  const cooling = keyStore.keys
    .filter(k => k.provider === provider && k.enabled)
    .sort((a, b) => (a.health?.cooldownUntil || 0) - (b.health?.cooldownUntil || 0));
  return cooling[0] || null;
}

function markSuccess(id) {
  const k = keyStore.keys.find(x => x.id === id);
  if (!k) return;
  k.health = k.health || {};
  k.health.fails = 0;
  k.health.lastError = null;
  k.health.cooldownUntil = 0;
  k.health.successCount = (k.health.successCount || 0) + 1;
  k.health.lastUsed = Date.now();
  saveKeys();
}
function markFailure(id, err) {
  const k = keyStore.keys.find(x => x.id === id);
  if (!k) return;
  k.health = k.health || {};
  k.health.fails = (k.health.fails || 0) + 1;
  k.health.lastError = String(err || 'unknown').slice(0, 220);
  k.health.cooldownUntil = Date.now() + COOLDOWN_MS;
  saveKeys();
}

/* =========================================================
   PROVIDERS
   ========================================================= */
const PROVIDERS = {
  gemini: {
    label: 'Google Gemini',
    defaultModel: 'gemini-2.0-flash',
    url: (key, model) => `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${key}`,
    headers: () => ({}),
    build: (messages, model) => {
      const sys = messages.find(m => m.role === 'system');
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      const body = { contents };
      if (sys) body.systemInstruction = { parts: [{ text: sys.content }] };
      return body;
    },
    parse: (d) => d?.candidates?.[0]?.content?.parts?.[0]?.text || '',
  },
  openai: {
    label: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    url: () => 'https://api.openai.com/v1/chat/completions',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
    build: (messages, model) => ({ model: model || 'gpt-4o-mini', messages }),
    parse: (d) => d?.choices?.[0]?.message?.content || '',
  },
  deepseek: {
    label: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    url: () => 'https://api.deepseek.com/v1/chat/completions',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
    build: (messages, model) => ({ model: model || 'deepseek-chat', messages }),
    parse: (d) => d?.choices?.[0]?.message?.content || '',
  },
  claude: {
    label: 'Anthropic Claude',
    defaultModel: 'claude-3-5-sonnet-latest',
    url: () => 'https://api.anthropic.com/v1/messages',
    headers: (key) => ({ 'x-api-key': key, 'anthropic-version': '2023-06-01' }),
    build: (messages, model) => {
      const sys = messages.find(m => m.role === 'system');
      const rest = messages.filter(m => m.role !== 'system');
      const body = { model: model || 'claude-3-5-sonnet-latest', max_tokens: 2048, messages: rest };
      if (sys) body.system = sys.content;
      return body;
    },
    parse: (d) => d?.content?.[0]?.text || '',
  },
};

async function callProvider(entry, provider, messages, model, temperature) {
  const p = PROVIDERS[provider];
  if (!p) throw new Error('unknown provider');

  const url = p.url(entry.key, model);
  const headers = { 'Content-Type': 'application/json', ...p.headers(entry.key) };
  const body = p.build(messages, model);
  if (temperature != null && body && typeof body === 'object') {
    body.temperature = Math.max(0, Math.min(2, Number(temperature)));
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  let resp;
  try {
    resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }

  const raw = await resp.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = { raw }; }

  if (!resp.ok) {
    const msg = data?.error?.message || data?.message || `HTTP ${resp.status}`;
    const err = new Error(msg);
    err.status = resp.status;
    throw err;
  }
  const parsed = p.parse(data);
  if (!parsed) throw new Error('empty response from provider');
  return parsed;
}

/* =========================================================
   ROUTES
   ========================================================= */
app.get('/api/providers', (req, res) => {
  res.json(Object.entries(PROVIDERS).map(([id, p]) => ({
    id, label: p.label, defaultModel: p.defaultModel
  })));
});

app.get('/api/health', (req, res) => {
  const now = Date.now();
  const providers = {};
  for (const pid of Object.keys(PROVIDERS)) {
    const list = keyStore.keys.filter(k => k.provider === pid);
    providers[pid] = {
      total: list.length,
      enabled: list.filter(k => k.enabled).length,
      available: list.filter(k => k.enabled && (!k.health?.cooldownUntil || k.health.cooldownUntil < now)).length,
    };
  }
  res.json({ ok: true, uptime: process.uptime(), providers });
});

/* --- key management --- */
app.get('/api/keys', (req, res) => {
  res.json(keyStore.keys.map(k => ({
    id: k.id,
    provider: k.provider,
    providerLabel: PROVIDERS[k.provider]?.label || k.provider,
    label: k.label,
    masked: maskKey(k.key),
    enabled: k.enabled,
    health: {
      fails: k.health?.fails || 0,
      successCount: k.health?.successCount || 0,
      lastError: k.health?.lastError || null,
      cooldownUntil: k.health?.cooldownUntil || 0,
      lastUsed: k.health?.lastUsed || null,
    },
  })));
});

app.post('/api/keys', (req, res) => {
  const { provider, key, label } = req.body || {};
  if (!provider || !key) return res.status(400).json({ error: 'provider and key required' });
  if (!PROVIDERS[provider]) return res.status(400).json({ error: 'unknown provider' });
  const entry = {
    id: genId(),
    provider,
    key: String(key).trim(),
    label: (label || `${PROVIDERS[provider].label} key`).trim(),
    enabled: true,
    health: { fails: 0, successCount: 0, lastError: null, cooldownUntil: 0, lastUsed: null },
  };
  keyStore.keys.push(entry);
  saveKeys();
  res.json({ ok: true, id: entry.id });
});

app.delete('/api/keys/:id', (req, res) => {
  const before = keyStore.keys.length;
  keyStore.keys = keyStore.keys.filter(k => k.id !== req.params.id);
  saveKeys();
  res.json({ ok: true, removed: before - keyStore.keys.length });
});

app.post('/api/keys/:id/toggle', (req, res) => {
  const k = keyStore.keys.find(x => x.id === req.params.id);
  if (!k) return res.status(404).json({ error: 'not found' });
  k.enabled = !k.enabled;
  saveKeys();
  res.json({ ok: true, enabled: k.enabled });
});

app.post('/api/keys/:id/reset', (req, res) => {
  const k = keyStore.keys.find(x => x.id === req.params.id);
  if (!k) return res.status(404).json({ error: 'not found' });
  k.health = { fails: 0, successCount: 0, lastError: null, cooldownUntil: 0, lastUsed: null };
  saveKeys();
  res.json({ ok: true });
});

/* --- chat with automatic rotation --- */
app.post('/api/chat', async (req, res) => {
  const { provider, messages, model, temperature } = req.body || {};
  if (!provider || !PROVIDERS[provider]) return res.status(400).json({ error: 'invalid provider' });
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'messages required' });

  const enabled = keyStore.keys.filter(k => k.provider === provider && k.enabled);
  if (enabled.length === 0) return res.status(400).json({ error: `no enabled keys for ${provider}` });

  const maxAttempts = Math.min(enabled.length, 5);
  const tried = new Set();
  const attemptsLog = [];

  for (let i = 0; i < maxAttempts; i++) {
    const untried = enabled.filter(k => !tried.has(k.id));
    if (untried.length === 0) break;

    // pick best from untried (prefer healthy, then oldest used)
    untried.sort((a, b) =>
      (a.health?.fails || 0) - (b.health?.fails || 0) ||
      ((a.health?.lastUsed || 0) - (b.health?.lastUsed || 0))
    );
    const entry = untried[0];
    tried.add(entry.id);

    try {
      const text = await callProvider(entry, provider, messages, model, temperature);
      markSuccess(entry.id);
      return res.json({
        ok: true,
        text,
        keyId: entry.id,
        keyLabel: entry.label,
        attempt: i + 1,
        attempts: attemptsLog,
      });
    } catch (e) {
      markFailure(entry.id, e.message);
      attemptsLog.push({ keyId: entry.id, keyLabel: entry.label, error: e.message, status: e.status });
    }
  }

  res.status(502).json({
    error: 'all keys failed',
    attempts: attemptsLog,
  });
});

app.listen(PORT, () => {
  console.log(`\n⚡ Epic Agent server running`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Keys file: ${KEYS_FILE}\n`);
});