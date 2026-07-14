import type { CollegeIdentity } from '../models/collegeIdentity.js';
import { normalizeText } from '../utils/normalization.js';

/**
 * Performs normalized, case-insensitive and punctuation-insensitive search
 * across college identity fields.
 */
export class CollegeSearchEngine {
  search(colleges: readonly CollegeIdentity[], query: string): CollegeIdentity[] {
    const normalizedQuery = normalizeText(query);

    if (normalizedQuery.length === 0) {
      return [];
    }

    const queryTokens = normalizedQuery.split(' ').filter((token) => token.length > 0);
    const matches = new Set<CollegeIdentity>();

    for (const college of colleges) {
      const searchable = this.buildSearchableText(college);
      const normalizedSearchable = normalizeText(searchable);

      for (const token of queryTokens) {
        if (normalizedSearchable.includes(token)) {
          matches.add(college);
          break;
        }
      }
    }

    return Array.from(matches);
  }

  private buildSearchableText(college: CollegeIdentity): string {
    return [
      college.officialName,
      college.shortName,
      ...college.aliases,
      ...college.knownKeywords,
      college.city,
      college.district,
      college.state,
      college.university,
    ].join(' ');
  }
}
