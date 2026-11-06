import { createHash, randomBytes } from "crypto";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
