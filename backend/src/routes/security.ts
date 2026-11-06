import { Router } from "express";
import { authMiddleware, requireSession } from "../middleware/auth";
import { query } from "../db";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/events",
  authMiddleware,
  requireSession,
  asyncHandler(async (req, res) => {
    const events = await query(
      `SELECT id, action, ip, created_at FROM security_events
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.auth!.userId]
    );
    res.json({ events: events.rows });
  })
);

export default router;
