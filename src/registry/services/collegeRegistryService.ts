import type { CollegeIdentity } from '../models/collegeIdentity.js';
import { CollegeSearchEngine } from '../search/collegeSearchEngine.js';
import { extractDomain, normalizeText } from '../utils/normalization.js';

/**
 * In-memory registry of canonical college identities.
 *
 * This is the single source of truth for college recognition across VCIE.
 * It is intended to be manually curated and never modified automatically by crawlers.
 */
export class CollegeRegistryService {
  private readonly colleges = new Map<string, CollegeIdentity>();
  private readonly searchEngine = new CollegeSearchEngine();

  /**
   * Registers a new college identity.
   * Throws if the id or official name is already registered.
   */
  register(college: CollegeIdentity): CollegeIdentity {
    if (this.colleges.has(college.id)) {
      throw new Error(`College with id "${college.id}" already exists`);
    }

    if (this.findByOfficialName(college.officialName)) {
      throw new Error(`College with official name "${college.officialName}" already exists`);
    }

    this.colleges.set(college.id, college);
    return college;
  }

  findById(id: string): CollegeIdentity | undefined {
    return this.colleges.get(id);
  }

  findByOfficialName(name: string): CollegeIdentity | undefined {
    const normalized = normalizeText(name);

    for (const college of this.colleges.values()) {
      if (normalizeText(college.officialName) === normalized) {
        return college;
      }
    }

    return undefined;
  }

  findByAlias(alias: string): CollegeIdentity | undefined {
    const normalized = normalizeText(alias);

    for (const college of this.colleges.values()) {
      if (college.aliases.some((candidate) => normalizeText(candidate) === normalized)) {
        return college;
      }
    }

    return undefined;
  }

  findByDomain(domain: string): CollegeIdentity | undefined {
    const normalizedDomain = extractDomain(domain);

    for (const college of this.colleges.values()) {
      if (college.knownDomains.some((candidate) => extractDomain(candidate) === normalizedDomain)) {
        return college;
      }
    }

    return undefined;
  }

  search(query: string): CollegeIdentity[] {
    return this.searchEngine.search(Array.from(this.colleges.values()), query);
  }

  getAll(): CollegeIdentity[] {
    return Array.from(this.colleges.values());
  }
}
