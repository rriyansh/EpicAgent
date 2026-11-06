import { Router } from "express";
import { authMiddleware, requireScope } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/",
  authMiddleware,
  requireScope("profile:read"),
  asyncHandler(async (req, res) => {
    res.json({
      profile: {
        id: req.auth?.userId,
        email: req.auth?.email,
      },
    });
  })
);

router.put(
  "/",
  authMiddleware,
  requireScope("profile:write"),
  asyncHandler(async (req, res) => {
    res.json({ message: "profile updated", id: req.auth?.userId });
  })
);

export default router;
