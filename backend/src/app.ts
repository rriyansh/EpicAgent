import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/error";
import { rateLimitMiddleware } from "./middleware/rateLimit";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import keysRoutes from "./routes/keys";
import agentRoutes from "./routes/agent";
import systemRoutes from "./routes/system";
import healthRoutes from "./routes/health";
import logger from "./config/logger";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(rateLimitMiddleware);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/keys", keysRoutes);
  app.use("/api/agent", agentRoutes);
  app.use("/api/system", systemRoutes);
  app.use("/api/health", healthRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  app.use(errorMiddleware);

  return app;
}
