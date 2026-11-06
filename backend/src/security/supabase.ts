import { createPublicKey, verify as verifySignature, type KeyObject } from "crypto";
import jwt from "jsonwebtoken";
import { env, supabaseConfigured } from "../config/env";
import { HttpError } from "./httpError";

type Jwk = {
  kid?: string;
  kty: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
  y?: string;
};

const jwksCache: { keys: Map<string, KeyObject>; fetchedAt: number } = {
  keys: new Map(),
  fetchedAt: 0,
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string };
};

function requireSupabase() {
  if (!supabaseConfigured() || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new HttpError(503, "supabase_unconfigured", "Set SUPABASE_URL and SUPABASE_ANON_KEY");
  }
  return { url: env.SUPABASE_URL.replace(/\/$/, ""), anon: env.SUPABASE_ANON_KEY };
}

async function supabaseFetch(path: string, init: RequestInit) {
  const { url, anon } = requireSupabase();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(`${url}${path}`, {
      ...init,
      redirect: "error",
      signal: controller.signal,
      headers: {
        apikey: anon,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new HttpError(503, "supabase_unreachable", "Supabase auth could not be reached");
  } finally {
    clearTimeout(timer);
  }
}

function readError(body: { error_description?: string; msg?: string; error?: string }) {
  const text = `${body.error_description ?? ""} ${body.msg ?? ""} ${body.error ?? ""}`.toLowerCase();
  if (text.includes("not confirmed") || text.includes("email not confirmed")) {
    return new HttpError(403, "email_not_confirmed", "Confirm your email before signing in");
  }
  if (text.includes("already") || text.includes("registered")) {
    return new HttpError(409, "account_exists", "An account with that email already exists");
  }
  return new HttpError(401, "invalid_credentials", "Email or password is incorrect");
}

function asSession(body: {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { id?: string; email?: string };
}): SessionTokens {
  if (!body.access_token || !body.refresh_token || !body.user?.id || !body.user.email) {
    throw new HttpError(403, "email_not_confirmed", "Confirm your email before signing in");
  }
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresIn: body.expires_in ?? 3600,
    user: { id: body.user.id, email: body.user.email },
  };
}

export async function signInWithPassword(email: string, password: string) {
  const res = await supabaseFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json().catch(() => ({}))) as Parameters<typeof readError>[0] & Parameters<typeof asSession>[0];
  if (!res.ok) throw readError(body);
  return asSession(body);
}

export async function signUpWithPassword(email: string, password: string) {
  const res = await supabaseFetch("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json().catch(() => ({}))) as Parameters<typeof readError>[0] & {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    user?: { id?: string; email?: string };
    id?: string;
  };
  if (!res.ok) throw readError(body);
  if (!body.access_token) {
    return { confirmationRequired: true as const, user: { id: body.user?.id ?? body.id ?? "", email } };
  }
  return { confirmationRequired: false as const, session: asSession(body) };
}

export async function refreshSession(refreshToken: string) {
  const res = await supabaseFetch("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const body = (await res.json().catch(() => ({}))) as Parameters<typeof readError>[0] & Parameters<typeof asSession>[0];
  if (!res.ok) throw new HttpError(401, "invalid_refresh", "Refresh token is invalid or already used");
  return asSession(body);
}

export async function signOut(accessToken: string) {
  await supabaseFetch("/auth/v1/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => undefined);
}

function claims(payload: jwt.JwtPayload) {
  if (!payload.sub) throw new HttpError(401, "invalid_token");
  const email = typeof payload.email === "string" ? payload.email : "";
  return { sub: payload.sub, email };
}

async function signingKeys() {
  const { url } = requireSupabase();
  if (Date.now() - jwksCache.fetchedAt < 10 * 60 * 1000 && jwksCache.keys.size > 0) return jwksCache.keys;
  const res = await supabaseFetch("/auth/v1/.well-known/jwks.json", { method: "GET", headers: {} });
  if (!res.ok) throw new HttpError(503, "jwks_unavailable", "Could not load Supabase signing keys");
  const body = (await res.json()) as { keys?: Jwk[] };
  const keys = new Map<string, KeyObject>();
  for (const jwk of body.keys ?? []) {
    if (!jwk.kid) continue;
    keys.set(jwk.kid, createPublicKey({ key: jwk as never, format: "jwk" }));
  }
  jwksCache.keys = keys;
  jwksCache.fetchedAt = Date.now();
  void url;
  return keys;
}

export async function verifySupabaseAccessToken(token: string) {
  const { url } = requireSupabase();
  const issuer = `${url}/auth/v1`;
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === "string") throw new HttpError(401, "invalid_token");

  if (decoded.header.alg === "HS256") {
    if (!env.SUPABASE_JWT_SECRET) throw new HttpError(401, "invalid_token");
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
      algorithms: ["HS256"],
      issuer,
      audience: "authenticated",
    });
    if (typeof payload === "string") throw new HttpError(401, "invalid_token");
    return claims(payload);
  }

  if (decoded.header.alg !== "ES256" && decoded.header.alg !== "RS256") {
    throw new HttpError(401, "invalid_token");
  }
  const kid = decoded.header.kid;
  if (!kid) throw new HttpError(401, "invalid_token");

  let keys = await signingKeys();
  let key = keys.get(kid);
  if (!key) {
    jwksCache.fetchedAt = 0;
    keys = await signingKeys();
    key = keys.get(kid);
  }
  if (!key) throw new HttpError(401, "invalid_token");

  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) throw new HttpError(401, "invalid_token");
  const data = Buffer.from(`${header}.${body}`);
  const sig = Buffer.from(signature, "base64url");
  const valid =
    decoded.header.alg === "ES256"
      ? verifySignature("sha256", data, { key, dsaEncoding: "ieee-p1363" }, sig)
      : verifySignature("sha256", data, key, sig);
  if (!valid) throw new HttpError(401, "invalid_token");

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as jwt.JwtPayload;
  const now = Math.floor(Date.now() / 1000);
  const audience = payload.aud;
  const audienceOk = audience === "authenticated" || (Array.isArray(audience) && audience.includes("authenticated"));
  if (payload.iss !== issuer || !audienceOk) throw new HttpError(401, "invalid_token");
  if (typeof payload.exp !== "number" || payload.exp < now) throw new HttpError(401, "invalid_token");
  if (typeof payload.nbf === "number" && payload.nbf > now + 5) throw new HttpError(401, "invalid_token");
  return claims(payload);
}
