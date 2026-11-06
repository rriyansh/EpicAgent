import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ status: "ok" });
  })
);

export default router;
