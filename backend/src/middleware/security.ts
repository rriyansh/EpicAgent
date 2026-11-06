import { randomUUID } from "crypto";
import type { CorsOptions } from "cors";
import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const incoming = req.headers["x-request-id"];
  const requestId = typeof incoming === "string" && /^[\w-]{8,80}$/.test(incoming) ? incoming : randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-store");
  next();
}

export function corsOptions(): CorsOptions {
  const allowed = env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
  return {
    origin(origin, callback) {
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Api-Key", "X-Request-Id"],
    maxAge: 600,
  };
}

export function versionGate(req: Request, res: Response, next: NextFunction) {
  const requested = req.headers["x-api-version"];
  if (requested && requested !== "1") {
    return res.status(406).json({ error: "unsupported_version", message: "Use /api/v1" });
  }
  res.setHeader("X-Api-Version", "1");
  next();
}
