import type { RequestHandler } from 'express';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export const getHealth: RequestHandler = (_req, res) => {
  const response: HealthResponse = {
    status: 'ok',
    service: 'VCIE',
    version: '1.0.0',
  };

  res.status(200).json(response);
};
