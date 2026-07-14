import { describe, it, expect } from 'vitest';
import { Confidence, DocumentType, SourceType } from '../../domain/enums.js';
import type { CandidateSource } from '../types/candidateSource.js';
import { mergeDuplicateCandidates } from './duplicateDetector.js';
import { normalizeUrl } from './urlNormalizer.js';

const createCandidate = (url: string, confidence: Confidence, title: string): CandidateSource => ({
  id: `${title}-${confidence}`,
  title,
  url,
  sourceType: SourceType.OFFICIAL_WEBSITE,
  documentType: DocumentType.BROCHURE,
  confidence,
  metadata: { title },
});

describe('normalizeUrl', () => {
  it('lowercases protocol and hostname', () => {
    expect(normalizeUrl('https://Example.COM/path')).toBe('https://example.com/path');
  });

  it('removes trailing slashes', () => {
    expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com/path');
  });

  it('removes default https port', () => {
    expect(normalizeUrl('https://example.com:443/path')).toBe('https://example.com/path');
  });

  it('strips hash and sorts query parameters', () => {
    expect(normalizeUrl('https://example.com/page?z=1&a=2#section')).toBe('https://example.com/page?a=2&z=1');
  });

  it('returns trimmed lowercased input on invalid URL', () => {
    expect(normalizeUrl('  not-a-url  ')).toBe('not-a-url');
  });
});

describe('mergeDuplicateCandidates', () => {
  it('keeps unique candidates unchanged', () => {
    const candidates = [
      createCandidate('https://a.com/1', Confidence.HIGH, 'A'),
      createCandidate('https://b.com/2', Confidence.HIGH, 'B'),
    ];

    const result = mergeDuplicateCandidates(candidates);

    expect(result).toHaveLength(2);
  });

  it('merges duplicate URLs and keeps the highest confidence candidate', () => {
    const candidates = [
      createCandidate('https://example.com/page', Confidence.LOW, 'Low'),
      createCandidate('https://example.com/page/', Confidence.HIGH, 'High'),
      createCandidate('https://other.com/', Confidence.MEDIUM, 'Other'),
    ];

    const result = mergeDuplicateCandidates(candidates);

    expect(result).toHaveLength(2);
    const kept = result.find((c) => c.url === 'https://example.com/page');
    expect(kept?.confidence).toBe(Confidence.HIGH);
    expect(kept?.title).toBe('High');
  });
});
