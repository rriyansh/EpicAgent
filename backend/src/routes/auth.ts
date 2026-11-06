import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { audit, emailFingerprint } from "../security/audit";
import { HttpError } from "../security/httpError";
import { refreshSession, signInWithPassword, signOut, signUpWithPassword } from "../security/supabase";
import { linkSupabaseUser } from "../security/users";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const credentials = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = credentials.parse(req.body);
    const result = await signUpWithPassword(body.email, body.password);
    if (result.confirmationRequired) {
      await audit(req, "register_pending", undefined, { email: emailFingerprint(body.email) });
      return res.status(202).json({ confirmationRequired: true, email: body.email });
    }
    const user = await linkSupabaseUser(result.session.user.id, result.session.user.email);
    await audit(req, "register", user.id);
    res.status(201).json(sessionBody(result.session, user));
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = credentials.parse(req.body);
    try {
      const session = await signInWithPassword(body.email, body.password);
      const user = await linkSupabaseUser(session.user.id, session.user.email);
      await audit(req, "login_success", user.id);
      res.json(sessionBody(session, user));
    } catch (err) {
      await audit(req, "login_failed", undefined, { email: emailFingerprint(body.email) });
      throw err;
    }
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const body = z.object({ refreshToken: z.string().min(20).max(4096) }).parse(req.body);
    const session = await refreshSession(body.refreshToken);
    const user = await linkSupabaseUser(session.user.id, session.user.email);
    await audit(req, "token_rotated", user.id);
    res.json(sessionBody(session, user));
  })
);

router.post(
  "/logout",
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (req.auth?.accessToken) await signOut(req.auth.accessToken);
    await audit(req, "logout", req.auth?.userId);
    res.json({ ok: true });
  })
);

router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new HttpError(401, "unauthorized");
    res.json({
      user: {
        id: req.auth.userId,
        email: req.auth.email,
        method: req.auth.method,
        scopes: req.auth.scopes,
      },
    });
  })
);

function sessionBody(
  session: { accessToken: string; refreshToken: string; expiresIn: number },
  user: { id: string; email: string }
) {
  return {
    token: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: session.expiresIn,
    tokenType: "bearer",
    user,
  };
}

export default router;
