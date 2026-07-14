import * as cheerio from 'cheerio';
import type { CollegeIdentity } from '../../registry/models/collegeIdentity.js';
import { Confidence, DocumentType, SourceType } from '../../domain/enums.js';
import type { DiscoveryStrategy } from '../interfaces/discoveryStrategy.js';
import type { CandidateSource } from '../types/candidateSource.js';
import { normalizeUrl } from '../utils/urlNormalizer.js';

export interface HtmlHttpClient {
  get(url: string): Promise<{ data: string }>;
}

const FILTER_KEYWORDS = [
  'placement',
  'training',
  'recruitment',
  'career',
  'nirf',
  'mandatory',
  'disclosure',
  'naac',
  'ssr',
  'iqac',
  'annual report',
  'annual',
  'report',
  'downloads',
  'pdf',
];

/**
 * Real implementation of official-website discovery for DJSCE.
 *
 * Fetches the college homepage, parses anchor tags with Cheerio, resolves and
 * normalizes URLs, filters by relevant keywords and produces candidate sources
 * with document-type guesses and confidence scores.
 */
export class OfficialWebsiteDiscoveryStrategy implements DiscoveryStrategy {
  private readonly httpClient: HtmlHttpClient;

  constructor(httpClient: HtmlHttpClient) {
    this.httpClient = httpClient;
  }

  getName(): string {
    return 'OfficialWebsiteDiscoveryStrategy';
  }

  supports(college: CollegeIdentity): boolean {
    return college.shortName === 'DJSCE';
  }

  async discover(college: CollegeIdentity): Promise<CandidateSource[]> {
    const response = await this.httpClient.get(college.officialWebsite);
    const html = response.data;
    const $ = cheerio.load(html);

    const baseUrl = college.officialWebsite;
    const seen = new Set<string>();
    const candidates: CandidateSource[] = [];

    $('a[href]').each((_, element) => {
      const $el = $(element);
      const rawHref = $el.attr('href') ?? '';
      const absoluteUrl = this.resolveUrl(rawHref, baseUrl);

      if (!this.isHttpUrl(absoluteUrl)) {
        return;
      }

      const normalized = normalizeUrl(absoluteUrl);
      if (seen.has(normalized)) {
        return;
      }
      seen.add(normalized);

      const title = $el.text().trim() || $el.attr('title')?.trim() || 'Untitled Link';
      const searchableText = `${title} ${absoluteUrl}`.toLowerCase();
      if (!this.matchesKeyword(searchableText)) {
        return;
      }

      candidates.push({
        id: `${this.getName()}-${college.id}-${candidates.length}`,
        title,
        url: normalized,
        sourceType: SourceType.OFFICIAL_WEBSITE,
        documentType: this.guessDocumentType(searchableText, normalized),
        confidence: this.assessConfidence(normalized, college),
        metadata: {
          anchorText: title,
          discoveredBy: this.getName(),
        },
      });
    });

    return candidates;
  }

  private resolveUrl(href: string, baseUrl: string): string {
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return href;
    }
  }

  private isHttpUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  private matchesKeyword(text: string): boolean {
    return FILTER_KEYWORDS.some((keyword) => text.includes(keyword));
  }

  private guessDocumentType(text: string, url: string): DocumentType {
    const combined = `${text} ${url}`.toLowerCase();

    if (
      combined.includes('placement') ||
      combined.includes('training') ||
      combined.includes('recruitment') ||
      combined.includes('career')
    ) {
      return DocumentType.PLACEMENT_REPORT;
    }

    if (
      combined.includes('nirf') ||
      combined.includes('naac') ||
      combined.includes('ssr') ||
      combined.includes('iqac') ||
      combined.includes('mandatory') ||
      combined.includes('disclosure') ||
      combined.includes('annual report') ||
      combined.includes('annual') ||
      combined.includes('report')
    ) {
      return DocumentType.BROCHURE;
    }

    if (combined.includes('fee') || combined.includes('admission')) {
      return DocumentType.FEE_STRUCTURE;
    }

    return DocumentType.OTHER;
  }

  private assessConfidence(url: string, college: CollegeIdentity): Confidence {
    if (url.toLowerCase().endsWith('.pdf')) {
      return Confidence.HIGH;
    }

    try {
      const collegeDomain = new URL(college.officialWebsite).hostname.replace(/^www\./, '');
      const linkDomain = new URL(url).hostname.replace(/^www\./, '');

      if (linkDomain !== collegeDomain) {
        return Confidence.LOW;
      }
    } catch {
      return Confidence.LOW;
    }

    return Confidence.MEDIUM;
  }
}
