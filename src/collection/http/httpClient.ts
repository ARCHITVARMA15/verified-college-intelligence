import axios from 'axios';

export interface HttpResponse {
  data: Buffer;
  contentType?: string;
}

export interface HttpClient {
  get(url: string): Promise<HttpResponse>;
}

interface RobustHttpClientOptions {
  timeoutMs: number;
  maxRetries: number;
  requestDelayMs: number;
}

export class RobustHttpClient implements HttpClient {
  private readonly options: RobustHttpClientOptions;

  constructor(options: Partial<RobustHttpClientOptions> = {}) {
    this.options = {
      timeoutMs: options.timeoutMs ?? 15_000,
      maxRetries: options.maxRetries ?? 3,
      requestDelayMs: options.requestDelayMs ?? 500,
    };
  }

  async get(url: string): Promise<HttpResponse> {
    let lastError: unknown;

    for (let attempt = 0; attempt < this.options.maxRetries; attempt += 1) {
      try {
        await this.delay(this.options.requestDelayMs * attempt);
        const response = await axios.get(url, {
          timeout: this.options.timeoutMs,
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'VCIE-College-Document-Collector/1.0 (Academic research)',
          },
        });

        const contentType = String(response.headers['content-type'] ?? '');
        const data = Buffer.from(response.data as ArrayBuffer);

        return { data, contentType };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
