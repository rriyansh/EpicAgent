
import { Response, NextFunction, Request } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = status >= 500 ? 'Internal server error' : (err?.message || 'Error');
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ error: message });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}