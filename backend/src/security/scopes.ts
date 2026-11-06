export const SCOPES = [
  "agent:run",
  "profile:read",
  "profile:write",
  "system:read",
] as const;

export type Scope = (typeof SCOPES)[number];

export const SESSION_SCOPES: Scope[] = [...SCOPES];

export function isScope(value: string): value is Scope {
  return (SCOPES as readonly string[]).includes(value);
}
