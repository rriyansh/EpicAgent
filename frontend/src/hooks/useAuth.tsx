import { useState } from "react";
import { apiLogin } from "../lib/api";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      setToken(data.token ?? null);
      return data;
    } finally {
      setLoading(false);
    }
  }

  return { token, login, loading };
}
