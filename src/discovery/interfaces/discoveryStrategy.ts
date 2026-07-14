import type { College } from '../../domain/college.js';
import type { CandidateSource } from '../types/candidateSource.js';

/**
 * Contract implemented by every source discovery strategy.
 */
export interface DiscoveryStrategy {
  /** Human-readable name of the strategy, used for registration and logging. */
  getName(): string;

  /**
   * Determines whether this strategy can discover sources for the given college.
   * Future strategies may check region, university affiliation or available metadata.
   */
  supports(college: College): boolean;

  /**
   * Discovers candidate sources for the college.
   * Does not download any documents; only returns metadata about potential sources.
   */
  discover(college: College): Promise<CandidateSource[]>;
}
