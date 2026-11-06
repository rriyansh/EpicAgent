import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export function signToken(payload: object): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, env.JWT_SECRET);
}
