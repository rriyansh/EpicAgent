import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { HttpError } from "../security/httpError";

export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "invalid_request",
      message: "Check the submitted fields",
      requestId: req.requestId,
    });
  }

  const status = err instanceof HttpError ? err.status : 500;
  const code = err instanceof HttpError ? err.code : "internal_error";
  const message =
    err instanceof HttpError
      ? err.message
      : env.NODE_ENV === "production"
        ? "Something went wrong"
        : err instanceof Error
          ? err.message
          : "Something went wrong";

  logger.error(
    {
      requestId: req.requestId,
      code,
      status,
      message: err instanceof Error ? err.message : "unknown",
    },
    "request failed"
  );

  res.status(status).json({ error: code, message, requestId: req.requestId });
}

export default errorMiddleware;
