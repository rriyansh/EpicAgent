export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  fingerprint: string;
  publicKey: string;
  lastSeenAt: Date;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: string[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface AgentSession {
  id: string;
  userId: string;
  deviceId: string | null;
  status: "idle" | "running" | "stopped";
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
