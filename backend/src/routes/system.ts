import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/info",
  asyncHandler(async (_req, res) => {
    res.json({
      name: "epic-agent",
      version: "1.0.0",
      time: new Date().toISOString(),
    });
  })
);

export default router;
