import { Router } from "express";
import { authMiddleware, requireScope } from "../middleware/auth";
import { env, supabaseConfigured } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/info",
  asyncHandler(async (_req, res) => {
    res.json({ name: "epic-agent", version: "1.1.0" });
  })
);

router.get(
  "/security",
  authMiddleware,
  requireScope("system:read"),
  asyncHandler(async (_req, res) => {
    res.json({
      auth: "supabase",
      supabaseConfigured: supabaseConfigured(),
      apiKeyAuth: true,
      keyRotation: true,
      version: "v1",
      production: env.NODE_ENV === "production",
    });
  })
);

export default router;
