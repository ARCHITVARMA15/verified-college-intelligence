import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

interface HttpError extends Error {
  statusCode?: number;
}

export const errorHandler: ErrorRequestHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode && err.statusCode > 0 ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  logger.error({ err, statusCode }, 'Request error');

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
};
