import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authMiddleware,
  asyncHandler(async (_req, res) => {
    res.json({ keys: [] });
  })
);

router.post(
  "/",
  authMiddleware,
  asyncHandler(async (_req, res) => {
    res.json({ message: "key created" });
  })
);

export default router;
