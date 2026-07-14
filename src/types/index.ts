export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

export interface ServiceHealth {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
}
