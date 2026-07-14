import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, extname } from 'node:path';
import type { HttpClient } from '../http/httpClient.js';

export interface DownloadResult {
  success: boolean;
  bytes?: number;
  skipped: boolean;
  error?: string;
}

interface DownloaderOptions {
  maxFileSizeBytes: number;
}

const DEFAULT_OPTIONS: DownloaderOptions = {
  maxFileSizeBytes: 50 * 1024 * 1024,
};

export class Downloader {
  private readonly httpClient: HttpClient;
  private readonly options: DownloaderOptions;

  constructor(httpClient: HttpClient, options: Partial<DownloaderOptions> = {}) {
    this.httpClient = httpClient;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async download(url: string, filePath: string): Promise<DownloadResult> {
    if (existsSync(filePath)) {
      return { success: true, skipped: true };
    }

    try {
      const response = await this.httpClient.get(url);

      if (response.data.length > this.options.maxFileSizeBytes) {
        return {
          success: false,
          skipped: false,
          error: `File exceeds size limit of ${this.options.maxFileSizeBytes} bytes`,
        };
      }

      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, response.data);

      return { success: true, bytes: response.data.length, skipped: false };
    } catch (error) {
      return {
        success: false,
        skipped: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/**
 * Generates a safe filename from a URL and an optional explicit extension.
 */
export const buildLocalFilename = (
  url: string,
  documentType: string,
  existingNames: Set<string>,
): string => {
  const urlExtension = extname(new URL(url).pathname).toLowerCase();
  const extension = urlExtension.length > 0 ? urlExtension.slice(1) : 'html';
  const baseName = documentType.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  let candidate = `${baseName}.${extension}`;
  let counter = 1;

  while (existingNames.has(candidate)) {
    const stem = `${baseName}-${counter}`;
    candidate = `${stem}.${extension}`;
    counter += 1;
  }

  existingNames.add(candidate);
  return candidate;
};
