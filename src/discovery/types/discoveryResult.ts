import type { CandidateSource } from './candidateSource.js';
import type { DiscoveryError } from './discoveryError.js';

/**
 * Aggregated output of a discovery run for a single college.
 */
export interface DiscoveryResult {
  /** Identifier of the college that was scanned. */
  collegeId: string;

  /**
   * Name or label of the discovery runner.
   * When multiple strategies are combined this value is 'DiscoveryService'.
   */
  strategy: string;

  /** Timestamp when the discovery run started. */
  startedAt: Date;

  /** Timestamp when the discovery run finished. */
  finishedAt: Date;

  /** Deduplicated and sorted candidate sources discovered across all strategies. */
  candidateSources: CandidateSource[];

  /** Errors encountered while executing individual strategies. */
  errors: DiscoveryError[];
}
