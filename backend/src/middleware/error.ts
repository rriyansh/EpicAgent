import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  const status = err.status ?? 500;
  const message = err.message ?? "internal server error";

  res.status(status).json({
    error: err.code ?? "internal_error",
    message,
  });
}

export default errorMiddleware;
