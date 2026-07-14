import { describe, it, expect } from 'vitest';
import { getHealth } from './healthController.js';
import type { Request, Response } from 'express';

interface MockResponse extends Response {
  statusCode: number;
  jsonBody: unknown;
}

const createMockResponse = (): MockResponse => {
  let statusCode = 200;
  let jsonBody: unknown = null;

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      jsonBody = body;
      return this;
    },
  } as unknown as MockResponse;

  Object.defineProperty(res, 'statusCode', {
    get: () => statusCode,
  });

  Object.defineProperty(res, 'jsonBody', {
    get: () => jsonBody,
  });

  return res;
};

describe('healthController', () => {
  it('returns a healthy status response', () => {
    const req = {} as Request;
    const res = createMockResponse();

    getHealth(req, res, () => undefined);

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({
      status: 'ok',
      service: 'VCIE',
      version: '1.0.0',
    });
  });
});
