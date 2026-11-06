import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get(
  "/sessions",
  authMiddleware,
  asyncHandler(async (_req, res) => {
    res.json({ sessions: [] });
  })
);

router.post(
  "/sessions",
  authMiddleware,
  asyncHandler(async (_req, res) => {
    res.json({ session: {} });
  })
);

export default router;
