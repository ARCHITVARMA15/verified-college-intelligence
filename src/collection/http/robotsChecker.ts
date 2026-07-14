import type { HttpClient } from './httpClient.js';

interface ParsedRule {
  userAgent: string;
  disallowedPaths: string[];
}

/**
 * Minimal robots.txt parser that checks whether a path is disallowed for
 * a generic user agent.
 */
export class RobotsChecker {
  private readonly rulesByDomain = new Map<string, ParsedRule[]>();
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async isAllowed(url: string): Promise<boolean> {
    const parsed = new URL(url);
    const rules = await this.getRules(parsed.origin);

    const relevant = rules.find((rule) => rule.userAgent === '*') ?? rules[0];
    if (!relevant) {
      return true;
    }

    return !relevant.disallowedPaths.some((path) => parsed.pathname.startsWith(path));
  }

  private async getRules(origin: string): Promise<ParsedRule[]> {
    const cached = this.rulesByDomain.get(origin);
    if (cached) {
      return cached;
    }

    const rules = await this.fetchRules(origin);
    this.rulesByDomain.set(origin, rules);
    return rules;
  }

  private async fetchRules(origin: string): Promise<ParsedRule[]> {
    try {
      const response = await this.httpClient.get(`${origin}/robots.txt`);
      const text = response.data.toString('utf-8');
      return this.parse(text);
    } catch {
      return [];
    }
  }

  private parse(text: string): ParsedRule[] {
    const rules: ParsedRule[] = [];
    let current: ParsedRule | null = null;

    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (line.length === 0 || line.startsWith('#')) {
        continue;
      }

      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();

      if (key === 'user-agent') {
        current = { userAgent: value, disallowedPaths: [] };
        rules.push(current);
      } else if (key === 'disallow' && current) {
        current.disallowedPaths.push(value);
      }
    }

    return rules;
  }
}
