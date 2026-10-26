
const BASE = '/api';

let accessToken: string | null = localStorage.getItem('epic.access');
let refreshToken: string | null = localStorage.getItem('epic.refresh');

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
  if (access) localStorage.setItem('epic.access', access);
  else localStorage.removeItem('epic.access');
  if (refresh) localStorage.setItem('epic.refresh', refresh);
  else localStorage.removeItem('epic.refresh');
}

export function getAccess() { return accessToken; }

async function doFetch(path: string, opts: RequestInit = {}, retry = true): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(BASE + path, { ...opts, headers });

  if (res.status === 401 && retry && refreshToken) {
    try {
      const refreshRes = await fetch(BASE + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setTokens(data.access, refreshToken);
        return doFetch(path, opts, false);
      }
    } catch {}
    setTokens(null, null);
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return res;
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await doFetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  const res = await doFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function apiPut<T = any>(path: string, body?: any): Promise<T> {
  const res = await doFetch(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await doFetch(path, { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}