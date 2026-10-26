import crypto from 'crypto';

const KEY_HEX = process.env.ENCRYPTION_KEY || '';
if (KEY_HEX.length < 64) {
  console.warn('[crypto] ENCRYPTION_KEY missing or too short — using insecure dev key. Set ENCRYPTION_KEY in .env before production.');
}
const KEY = Buffer.from(KEY_HEX.padEnd(64, '0').slice(0, 64), 'hex');

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

export function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••';
  return key.slice(0, 4) + '••••' + key.slice(-4);
}

export function randomId(bytes = 16): string {
  return crypto.randomBytes(bytes).toString('hex');
}
