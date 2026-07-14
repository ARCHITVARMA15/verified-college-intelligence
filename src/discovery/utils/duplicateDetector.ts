import { Confidence } from '../../domain/enums.js';
import type { CandidateSource } from '../types/candidateSource.js';
import { normalizeUrl } from './urlNormalizer.js';

const confidenceScore: Record<Confidence, number> = {
  [Confidence.HIGH]: 3,
  [Confidence.MEDIUM]: 2,
  [Confidence.LOW]: 1,
  [Confidence.UNVERIFIED]: 0,
};

/**
 * Merges candidate sources that point to the same normalized URL.
 *
 * When duplicates are found, the candidate with the highest confidence is kept.
 * This avoids processing the same document multiple times while preserving the
 * strongest provenance metadata.
 */
export const mergeDuplicateCandidates = (candidates: CandidateSource[]): CandidateSource[] => {
  const groups = new Map<string, CandidateSource[]>();

  for (const candidate of candidates) {
    const key = normalizeUrl(candidate.url);
    const existing = groups.get(key) ?? [];
    existing.push(candidate);
    groups.set(key, existing);
  }

  return Array.from(groups.values()).map((group) => {
    const canonicalUrl = normalizeUrl(group[0].url);

    const selected =
      group.length === 1
        ? group[0]
        : group.reduce<CandidateSource>(
            (best, current) =>
              confidenceScore[current.confidence] > confidenceScore[best.confidence]
                ? current
                : best,
            group[0],
          );

    return { ...selected, url: canonicalUrl };
  });
};
