import { Request, Response, NextFunction } from "express";

export function deviceMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next();
}

export default deviceMiddleware;
