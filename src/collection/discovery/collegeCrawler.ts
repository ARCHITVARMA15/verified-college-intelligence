import * as cheerio from 'cheerio';
import type { CollegeInput } from '../types/collegeInput.js';
import type { HttpClient } from '../http/httpClient.js';
import { RobotsChecker } from '../http/robotsChecker.js';
import {
  isHttpUrl,
  isAllowedDomain,
  resolveUrl,
  getDomain,
} from '../utils/urlUtils.js';
import { matchesKeyword } from '../utils/documentClassifier.js';

export interface CrawledLink {
  url: string;
  title: string;
  isPdf: boolean;
}

interface CollegeCrawlerOptions {
  maxDepth: number;
  maxDocuments: number;
  timeoutMs: number;
  maxRetries: number;
  requestDelayMs: number;
}

const DEFAULT_OPTIONS: CollegeCrawlerOptions = {
  maxDepth: 2,
  maxDocuments: 25,
  timeoutMs: 15_000,
  maxRetries: 3,
  requestDelayMs: 500,
};

export class CollegeCrawler {
  private readonly httpClient: HttpClient;
  private readonly robotsChecker: RobotsChecker;
  private readonly options: CollegeCrawlerOptions;

  constructor(httpClient: HttpClient, options: Partial<CollegeCrawlerOptions> = {}) {
    this.httpClient = httpClient;
    this.robotsChecker = new RobotsChecker(httpClient);
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async crawl(college: CollegeInput): Promise<CrawledLink[]> {
    const allowedDomains = [getDomain(college.website), college.website];
    const visited = new Set<string>();
    const discovered = new Map<string, CrawledLink>();
    const queue: Array<{ url: string; depth: number }> = [{ url: college.website, depth: 0 }];

    while (queue.length > 0) {
      const { url, depth } = queue.shift() as { url: string; depth: number };
      const normalized = this.normalizeUrl(url);

      if (visited.has(normalized)) {
        continue;
      }
      visited.add(normalized);

      if (!(await this.robotsChecker.isAllowed(normalized))) {
        continue;
      }

      try {
        const response = await this.httpClient.get(normalized);
        const contentType = response.contentType ?? '';

        if (contentType.includes('application/pdf') || normalized.toLowerCase().endsWith('.pdf')) {
          if (!discovered.has(normalized)) {
            discovered.set(normalized, { url: normalized, title: this.filenameFromUrl(normalized), isPdf: true });
          }
          continue;
        }

        if (!contentType.includes('text/html') && !normalized.toLowerCase().endsWith('.html')) {
          continue;
        }

        const html = response.data.toString('utf-8');
        const links = this.extractLinks(html, normalized, allowedDomains);

        for (const link of links) {
          if (link.isPdf) {
            if (!discovered.has(link.url)) {
              discovered.set(link.url, link);
            }
            continue;
          }

          if (depth < this.options.maxDepth && !visited.has(link.url)) {
            queue.push({ url: link.url, depth: depth + 1 });
          }
        }
      } catch (error) {
        // Continue with remaining URLs
        continue;
      }

      if (discovered.size >= this.options.maxDocuments) {
        break;
      }
    }

    return Array.from(discovered.values()).slice(0, this.options.maxDocuments);
  }

  private extractLinks(html: string, baseUrl: string, allowedDomains: string[]): CrawledLink[] {
    const $ = cheerio.load(html);
    const links: CrawledLink[] = [];

    $('a[href]').each((_, element) => {
      const $el = $(element);
      const rawHref = $el.attr('href') ?? '';
      const resolved = resolveUrl(rawHref, baseUrl);

      if (!resolved || !isHttpUrl(resolved) || !isAllowedDomain(resolved, allowedDomains)) {
        return;
      }

      const normalized = this.normalizeUrl(resolved);
      const title = $el.text().trim() || $el.attr('title')?.trim() || this.filenameFromUrl(normalized);

      if (!matchesKeyword(title, normalized)) {
        return;
      }

      links.push({
        url: normalized,
        title,
        isPdf: normalized.toLowerCase().endsWith('.pdf'),
      });
    });

    return links;
  }

  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      parsed.hash = '';
      return parsed.toString();
    } catch {
      return url;
    }
  }

  private filenameFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const segments = pathname.split('/');
      const last = segments[segments.length - 1] ?? 'document';
      return last.length > 0 ? last : 'document';
    } catch {
      return 'document';
    }
  }
}
