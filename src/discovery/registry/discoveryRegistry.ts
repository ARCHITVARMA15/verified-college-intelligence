import type { College } from '../../domain/college.js';
import type { DiscoveryStrategy } from '../interfaces/discoveryStrategy.js';
import type { CandidateSource } from '../types/candidateSource.js';

/**
 * Maintains a collection of discovery strategies and executes those that support a college.
 */
export class DiscoveryRegistry {
  private readonly strategies = new Map<string, DiscoveryStrategy>();

  /**
   * Registers a strategy. Throws if a strategy with the same name is already registered.
   */
  register(strategy: DiscoveryStrategy): void {
    const name = strategy.getName();

    if (this.strategies.has(name)) {
      throw new Error(`Discovery strategy "${name}" is already registered`);
    }

    this.strategies.set(name, strategy);
  }

  /**
   * Removes a previously registered strategy by name.
   */
  remove(name: string): void {
    this.strategies.delete(name);
  }

  /**
   * Returns the names of all registered strategies.
   */
  getStrategyNames(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Executes every registered strategy that supports the given college.
   * Returns a map from strategy name to its discovered candidate sources.
   */
  async executeAll(college: College): Promise<Map<string, CandidateSource[]>> {
    const results = new Map<string, CandidateSource[]>();

    for (const [name, strategy] of this.strategies.entries()) {
      if (strategy.supports(college)) {
        const candidates = await strategy.discover(college);
        results.set(name, candidates);
      }
    }

    return results;
  }
}
