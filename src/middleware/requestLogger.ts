import type { RequestHandler } from 'express';
import { logger } from '../config/logger.js';

export const requestLogger: RequestHandler = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    logger.info(
      {
        method: req.method,
        path: req.url,
        statusCode: res.statusCode,
        durationMs,
        requestId: typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'] : undefined,
      },
      `${req.method} ${req.url} ${String(res.statusCode)} - ${String(durationMs)}ms`,
    );
  });

  next();
};
