import type { CollegeIdentity } from '../../registry/models/collegeIdentity.js';
import { Confidence } from '../../domain/enums.js';
import type { DiscoveryRegistry } from '../registry/discoveryRegistry.js';
import type { CandidateSource } from '../types/candidateSource.js';
import type { DiscoveryError } from '../types/discoveryError.js';
import type { DiscoveryResult } from '../types/discoveryResult.js';
import { mergeDuplicateCandidates } from '../utils/duplicateDetector.js';

const confidenceOrder: Record<Confidence, number> = {
  [Confidence.HIGH]: 3,
  [Confidence.MEDIUM]: 2,
  [Confidence.LOW]: 1,
  [Confidence.UNVERIFIED]: 0,
};

/**
 * Orchestrates discovery across all registered strategies and returns a normalized result.
 */
export class DiscoveryService {
  private readonly registry: DiscoveryRegistry;

  constructor(registry: DiscoveryRegistry) {
    this.registry = registry;
  }

  /**
   * Runs discovery for a college, merges duplicate candidate sources by URL,
   * sorts them by descending confidence and returns the aggregated result.
   */
  async discover(college: CollegeIdentity): Promise<DiscoveryResult> {
    const startedAt = new Date();
    const errors: DiscoveryError[] = [];
    let candidateSources: CandidateSource[] = [];

    try {
      const results = await this.registry.executeAll(college);

      for (const candidates of results.values()) {
        candidateSources = candidateSources.concat(candidates);
      }

      candidateSources = mergeDuplicateCandidates(candidateSources);
      candidateSources = this.sortByConfidence(candidateSources);
    } catch (error) {
      errors.push({
        strategy: 'DiscoveryService',
        message: error instanceof Error ? error.message : String(error),
      });
    }

    return {
      collegeId: college.id,
      strategy: 'DiscoveryService',
      startedAt,
      finishedAt: new Date(),
      candidateSources,
      errors,
    };
  }

  private sortByConfidence(candidates: CandidateSource[]): CandidateSource[] {
    return [...candidates].sort(
      (a, b) => confidenceOrder[b.confidence] - confidenceOrder[a.confidence],
    );
  }
}
