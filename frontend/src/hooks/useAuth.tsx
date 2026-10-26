
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiGet, setTokens } from '../lib/api';
import { User, Profile } from '../types';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  needsOnboarding: boolean;
  setSession: (access: string, refresh: string) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>(null as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  async function refreshMe() {
    try {
      const data = await apiGet<{ user: User; profile: Profile }>('/auth/me');
      setUser(data.user);
      setProfile(data.profile);
      setNeedsOnboarding(!data.profile?.dob);
    } catch {
      setUser(null);
      setProfile(null);
    }
  }

  useEffect(() => {
    (async () => {
      const access = localStorage.getItem('epic.access');
      if (!access) { setLoading(false); return; }
      await refreshMe();
      setLoading(false);
    })();
  }, []);

  async function setSession(access: string, refresh: string) {
    setTokens(access, refresh);
    await refreshMe();
  }

  function logout() {
    setTokens(null, null);
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, needsOnboarding, setSession, refreshMe, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
