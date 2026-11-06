import { NextFunction, Request, Response } from "express";
import { authenticateApiKey, readApiKey } from "../security/apiKeys";
import { HttpError } from "../security/httpError";
import { SESSION_SCOPES, type Scope } from "../security/scopes";
import { verifySupabaseAccessToken } from "../security/supabase";
import { linkSupabaseUser } from "../security/users";

export interface AuthContext {
  userId: string;
  email: string;
  method: "supabase" | "api_key";
  scopes: Scope[];
  keyId?: string;
  supabaseId?: string;
  accessToken?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      requestId?: string;
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const apiKey = readApiKey(req);
    if (apiKey) {
      const key = await authenticateApiKey(apiKey);
      req.auth = { ...key, method: "api_key" };
      return next();
    }

    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new HttpError(401, "unauthorized", "Sign in is required");
    const token = header.slice(7).trim();
    const claims = await verifySupabaseAccessToken(token);
    const user = await linkSupabaseUser(claims.sub, claims.email);
    req.auth = {
      userId: user.id,
      email: user.email,
      method: "supabase",
      scopes: SESSION_SCOPES,
      supabaseId: claims.sub,
      accessToken: token,
    };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireScope(scope: Scope) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth?.scopes.includes(scope)) {
      return next(new HttpError(403, "forbidden", "This credential cannot perform that action"));
    }
    next();
  };
}

export function requireSession(req: Request, _res: Response, next: NextFunction) {
  if (req.auth?.method !== "supabase") {
    return next(new HttpError(403, "session_required", "API keys cannot manage credentials"));
  }
  next();
}

export default authMiddleware;
