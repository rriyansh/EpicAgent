
export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Profile {
  user_id: string;
  dob: string | null;
  accent: string;
  wallpaper: string;
  font_scale: 'small' | 'medium' | 'large' | 'xlarge';
  voice: string;
  speed: number;
  pitch: 'low' | 'medium' | 'high';
  volume: number;
  provider: string;
  temperature: number;
}

export interface ApiKey {
  id: string;
  provider: string;
  label: string;
  masked: string;
  enabled: boolean;
  fails: number;
  last_error: string | null;
  cooldown_until: number;
  success_count: number;
  last_used: number | null;
  created_at: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  error?: boolean;
  ts: number;
}

export interface ProviderInfo {
  id: string;
  label: string;
  defaultModel: string;
}