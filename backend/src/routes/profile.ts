import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authMiddleware,
  asyncHandler(async (_req, res) => {
    res.json({ profile: {} });
  })
);

router.put(
  "/",
  authMiddleware,
  asyncHandler(async (_req, res) => {
    res.json({ message: "profile updated" });
  })
);

export default router;
