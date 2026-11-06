import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (_req, res) => {
    res.json({ message: "register placeholder" });
  })
);

router.post(
  "/login",
  asyncHandler(async (_req, res) => {
    res.json({ message: "login placeholder" });
  })
);

router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (_req, res) => {
    res.json({ user: (req as any).user });
  })
);

export default router;
