export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'email' | 'google';
  avatar?: string;
}

export interface Profile {
  userId: string;
  dob: string | null;
  accent: string;
  wallpaper: string;
  fontScale: string;
  voice: string;
  voiceLanguage: string;
  speed: number;
  pitch: string;
  volume: number;
  provider: string;
  temperature: number;
  onboardingComplete: number;
  updatedAt: number;
}

export interface ApiKey {
  id: string;
  userId: string;
  provider: string;
  key: string;
  label: string;
  enabled: boolean;
  fails: number;
  lastError: string;
  cooldownUntil: number;
  successCount: number;
  lastUsed: number;
  createdAt: number;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  googleLogin: () => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  addApiKey: (provider: string, key: string, label?: string) => Promise<void>;
  toggleApiKey: (id: string) => Promise<void>;
  deleteApiKey: (id: string) => Promise<void>;
  resetApiKeyFailures: (id: string) => Promise<void>;
}

export interface DeviceInfo {
  isMobile: boolean;
  os: string;
  browser: string;
}
