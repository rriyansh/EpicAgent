import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorMiddleware } from "./middleware/error";
import { authLimiter, rateLimitMiddleware } from "./middleware/rateLimit";
import { corsOptions, requestContext } from "./middleware/security";
import v1 from "./routes/v1";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(requestContext);
  app.use(cors(corsOptions()));
  app.use(express.json({ limit: "256kb" }));
  app.use(rateLimitMiddleware);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1/auth", authLimiter);
  app.use("/api/auth", authLimiter);
  app.use("/api/v1", v1);
  app.use("/api", v1);

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  app.use(errorMiddleware);
  return app;
}
