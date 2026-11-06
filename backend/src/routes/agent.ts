import { Router } from "express";
import { authMiddleware, requireScope } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/sessions",
  authMiddleware,
  requireScope("agent:run"),
  asyncHandler(async (req, res) => {
    res.json({ sessions: [], userId: req.auth?.userId });
  })
);

router.post(
  "/sessions",
  authMiddleware,
  requireScope("agent:run"),
  asyncHandler(async (req, res) => {
    res.status(201).json({ session: { status: "idle", userId: req.auth?.userId } });
  })
);

export default router;
