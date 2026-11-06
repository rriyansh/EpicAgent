const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`request failed ${res.status}`);
  return res.json();
}

export function apiLogin(email: string, password: string) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
