import { Router } from "express";
import { versionGate } from "../middleware/security";
import agentRoutes from "./agent";
import authRoutes from "./auth";
import healthRoutes from "./health";
import keysRoutes from "./keys";
import profileRoutes from "./profile";
import securityRoutes from "./security";
import systemRoutes from "./system";

const router = Router();

router.use(versionGate);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/keys", keysRoutes);
router.use("/agent", agentRoutes);
router.use("/system", systemRoutes);
router.use("/security", securityRoutes);
router.use("/health", healthRoutes);

export default router;
