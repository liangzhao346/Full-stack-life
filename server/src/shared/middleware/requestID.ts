import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestID(req: Request, res: Response, next: NextFunction) {
  const incomingId = req.headers['x-request-id'] as string | undefined;
  req.id = incomingId || randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
}
