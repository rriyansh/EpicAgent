import { useState } from "react";
import { apiLogin } from "../lib/api";

const TOKEN_KEY = "epicagent.session";

export function readSession() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode */
  }
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => readSession());
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      const next = String(data.token ?? data.access_token ?? "signed-in");
      sessionStorage.setItem(TOKEN_KEY, next);
      setToken(next);
      return data;
    } finally {
      setLoading(false);
    }
  }

  return { token, login, loading, signedIn: Boolean(token) };
}
