import { useState, useEffect, createContext, useContext } from 'react';
import { User, Profile, AuthContextType, DeviceInfo } from './types';
import { detectDeviceInfo } from './lib/device';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(';').shift() || '' : '';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const device = detectDeviceInfo();
        setDeviceInfo(device);
        
        const accessToken = getCookie('access_token');
        const refreshToken = getCookie('refresh_token');
        
        if (!accessToken && !refreshToken) {
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setProfile(data.profile);
          setNeedsOnboarding(data.needsOnboarding || false);
        } else {
          if (refreshToken) {
            await refreshTokenFn();
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const refreshTokenFn = async () => {
      const refreshToken = getCookie('refresh_token');
      if (!refreshToken) return;
      
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken })
        });
        
        if (response.ok) {
          const data = await response.json();
          document.cookie = `access_token=${data.access}; path=/; HttpOnly`;
          document.cookie = `refresh_token=${data.refresh}; path=/; HttpOnly`;
          
          const meResponse = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${data.access}` }
          });
          
          if (meResponse.ok) {
            const meData = await meResponse.json();
            setUser(meData.user);
            setProfile(meData.profile);
            setNeedsOnboarding(meData.needsOnboarding || false);
          }
        } else {
          logoutFn();
        }
      } catch (error) {
        console.error('Refresh token error:', error);
        logoutFn();
      }
    };
    
    const logoutFn = () => {
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      setUser(null);
      setProfile(null);
      setNeedsOnboarding(false);
    };
    
    init();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const accessToken = getCookie('access_token');
        if (accessToken) {
          refreshTokenFn();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    document.cookie = `access_token=${data.access}; path=/; HttpOnly`;
    document.cookie = `refresh_token=${data.refresh}; path=/; HttpOnly`;
    setUser(data.user);
    setProfile(null);
    setNeedsOnboarding(data.needsOnboarding || false);
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const data = await response.json();
    document.cookie = `access_token=${data.access}; path=/; HttpOnly`;
    document.cookie = `refresh_token=${data.refresh}; path=/; HttpOnly`;
    setUser(data.user);
    setProfile(null);
    setNeedsOnboarding(true);
  };

  const googleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const logout = () => {
    logoutFn();
  };

  const refreshToken = async () => {
    await refreshTokenFn();
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookie('access_token')}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Profile update failed');
    }
    
    const profileData = await response.json();
    setProfile(profileData.profile);
    
    if (profileData.profile.onboarding_complete && needsOnboarding) {
      setNeedsOnboarding(false);
    }
  };

  const addApiKey = async (provider: string, key: string, label?: string) => {
    const response = await fetch('/api/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookie('access_token')}`
      },
      body: JSON.stringify({ provider, key, label })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add API key');
    }
  };

  const toggleApiKey = async (id: string) => {
    const response = await fetch(`/api/keys/${id}/toggle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getCookie('access_token')}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle API key');
    }
    
    const data = await response.json();
    
    setProfile(prev => {
      if (!prev) return prev;
      return { ...prev, apiKeys: prev.apiKeys?.map(k => 
        k.id === id ? { ...k, enabled: data.enabled } : k
      ) || [] };
    });
  };

  const deleteApiKey = async (id: string) => {
    const response = await fetch(`/api/keys/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getCookie('access_token')}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete API key');
    }
    
    setProfile(prev => {
      if (!prev) return prev;
      return { ...prev, apiKeys: prev.apiKeys?.filter(k => k.id !== id) || [] };
    });
  };

  const resetApiKeyFailures = async (id: string) => {
    const response = await fetch(`/api/keys/${id}/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getCookie('access_token')}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset API key');
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    needsOnboarding,
    login,
    register,
    googleLogin,
    logout,
    refreshToken,
    updateProfile,
    addApiKey,
    toggleApiKey,
    deleteApiKey,
    resetApiKeyFailures,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}