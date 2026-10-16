import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

interface ErrorResponseBody {
  title: string;
  status: number;
  detail?: string;
  request_id: string;
  errors?: unknown;
}

export function errorHandler(err: unknown, req: Request, res: Response<ErrorResponseBody>, _next: NextFunction) {
  const requestId = req.id || 'unknown';

  // Zod validation error
  if (err instanceof ZodError) {
    const appError = new (class extends AppError {
      constructor() {
        super('Validation failed', 'VALIDATION_ERROR', 422);
      }
    })();
    return res.status(422).json({
      title: appError.code,
      status: 422,
      detail: 'Input validation failed',
      request_id: requestId,
      errors: err.errors,
    });
  }

  // Operational (known) errors
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      title: err.code,
      status: err.statusCode,
      detail: err.message,
      request_id: requestId,
    });
  }

  // Unexpected / programming errors
  logger.error('Unhandled error', {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    request_id: requestId,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    title: 'Internal Error',
    status: 500,
    detail: 'An unexpected error occurred',
    request_id: requestId,
  });
}

export function notFoundHandler(req: Request, res: Response<ErrorResponseBody>) {
  res.status(404).json({
    title: 'NOT_FOUND',
    status: 404,
    detail: `Route not found: ${req.method} ${req.path}`,
    request_id: req.id || 'unknown',
  });
}
