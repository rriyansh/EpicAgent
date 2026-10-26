
import { decrypt } from '../utils/crypto';
import { ApiKeyRow, ChatMessage, Provider } from '../types';
import db from '../db';

const COOLDOWN_MS = parseInt(process.env.KEY_COOLDOWN_MS || '60000', 10);

interface ProviderConfig {
  url: (key: string, model: string) => string;
  headers: (key: string) => Record<string, string>;
  build: (messages: ChatMessage[], model: string, temperature: number) => any;
  parse: (data: any) => string;
  defaultModel: string;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  gemini: {
    defaultModel: 'gemini-2.0-flash',
    url: (key, model) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    headers: () => ({ 'Content-Type': 'application/json' }),
    build: (messages, _model, temperature) => {
      const sys = messages.find(m => m.role === 'system');
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      const body: any = { contents, generationConfig: { temperature } };
      if (sys) body.systemInstruction = { parts: [{ text: sys.content }] };
      return body;
    },
    parse: (d) => d?.candidates?.[0]?.content?.parts?.[0]?.text || '',
  },
  openai: {
    defaultModel: 'gpt-4o-mini',
    url: () => 'https://api.openai.com/v1/chat/completions',
    headers: (key) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }),
    build: (messages, model, temperature) => ({ model, messages, temperature }),
    parse: (d) => d?.choices?.[0]?.message?.content || '',
  },
  deepseek: {
    defaultModel: 'deepseek-chat',
    url: () => 'https://api.deepseek.com/v1/chat/completions',
    headers: (key) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }),
    build: (messages, model, temperature) => ({ model, messages, temperature }),
    parse: (d) => d?.choices?.[0]?.message?.content || '',
  },
  anthropic: {
    defaultModel: 'claude-3-5-sonnet-latest',
    url: () => 'https://api.anthropic.com/v1/messages',
    headers: (key) => ({
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    }),
    build: (messages, model, temperature) => {
      const sys = messages.find(m => m.role === 'system');
      const rest = messages.filter(m => m.role !== 'system');
      const body: any = { model, max_tokens: 2048, temperature, messages: rest };
      if (sys) body.system = sys.content;
      return body;
    },
    parse: (d) => d?.content?.[0]?.text || '',
  },
};

export function listProviders() {
  return (Object.keys(PROVIDERS) as Provider[]).map(id => ({
    id,
    label: {
      gemini: 'Google Gemini',
      openai: 'OpenAI',
      deepseek: 'DeepSeek',
      anthropic: 'Anthropic Claude',
    }[id],
    defaultModel: PROVIDERS[id].defaultModel,
  }));
}

function getKeysFor(userId: string, provider: Provider): ApiKeyRow[] {
  return db.prepare(
    `SELECT * FROM api_keys WHERE user_id = ? AND provider = ? AND enabled = 1 ORDER BY success_count DESC, fails ASC`
  ).all(userId, provider) as ApiKeyRow[];
}

function markSuccess(id: string) {
  db.prepare(
    `UPDATE api_keys SET fails = 0, cooldown_until = 0, last_error = NULL, success_count = success_count + 1, last_used = ? WHERE id = ?`
  ).run(Date.now(), id);
}

function markFailure(id: string, err: string) {
  db.prepare(
    `UPDATE api_keys SET fails = fails + 1, cooldown_until = ?, last_error = ? WHERE id = ?`
  ).run(Date.now() + COOLDOWN_MS, err.slice(0, 200), id);
}

async function callOne(
  provider: Provider,
  key: string,
  messages: ChatMessage[],
  model: string,
  temperature: number
): Promise<string> {
  const cfg = PROVIDERS[provider];
  const url = cfg.url(key, model);
  const body = cfg.build(messages, model, temperature);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: cfg.headers(key),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const raw = await res.text();
    let data: any;
    try { data = JSON.parse(raw); } catch { data = { raw }; }
    if (!res.ok) {
      const msg = data?.error?.message || data?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    const text = cfg.parse(data);
    if (!text) throw new Error('Empty response from provider');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

export interface ChatResult {
  text: string;
  attempts: number;
  keyLabel: string;
}

export async function chat(
  userId: string,
  provider: Provider,
  messages: ChatMessage[],
  model?: string,
  temperature = 0.7
): Promise<ChatResult> {
  const keys = getKeysFor(userId, provider);
  if (!keys.length) {
    const serverKey = provider === 'openai' ? process.env.OPENAI_API_KEY?.trim() : undefined;
    if (serverKey) {
      const text = await callOne(
        provider,
        serverKey,
        messages,
        model || PROVIDERS[provider].defaultModel,
        temperature
      );
      return { text, attempts: 1, keyLabel: 'Server OpenAI key' };
    }
    throw Object.assign(new Error(`No API keys configured for ${provider}. Add one in Settings.`), { status: 400 });
  }

  const now = Date.now();
  const usable = keys.filter(k => k.cooldown_until < now);
  const pool = usable.length ? usable : keys;
  const attemptsLog: { keyId: string; error: string }[] = [];

  for (let i = 0; i < Math.min(pool.length, 5); i++) {
    const row = pool[i];
    try {
      const plainKey = decrypt(row.key_encrypted);
      const text = await callOne(provider, plainKey, messages, model || PROVIDERS[provider].defaultModel, temperature);
      markSuccess(row.id);
      return { text, attempts: i + 1, keyLabel: row.label || `Key ${row.id.slice(0, 6)}` };
    } catch (e: any) {
      markFailure(row.id, e.message || 'unknown');
      attemptsLog.push({ keyId: row.id, error: e.message || 'unknown' });
    }
  }

  throw Object.assign(
    new Error(`All ${provider} keys failed. ${attemptsLog.map(a => a.error).join('; ')}`),
    { status: 502 }
  );
}
