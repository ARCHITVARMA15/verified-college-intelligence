import { describe, it, expect } from 'vitest';
import type { College } from '../../domain/college.js';
import { Confidence, DocumentType, SourceType } from '../../domain/enums.js';
import type { DiscoveryStrategy } from '../interfaces/discoveryStrategy.js';
import type { CandidateSource } from '../types/candidateSource.js';
import { DiscoveryRegistry } from './discoveryRegistry.js';

const createCollege = (): College => ({
  id: 'college-1',
  name: 'Test College',
  city: 'Pune',
  district: 'Pune',
  state: 'Maharashtra',
  collegeType: 'private',
  autonomous: false,
  nbaAccredited: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createMockStrategy = (
  name: string,
  supportsCollege: boolean,
  candidates: CandidateSource[],
): DiscoveryStrategy => ({
  getName: () => name,
  supports: () => supportsCollege,
  discover: async () => candidates,
});

describe('DiscoveryRegistry', () => {
  it('registers a strategy', () => {
    const registry = new DiscoveryRegistry();
    const strategy = createMockStrategy('Always', true, []);

    registry.register(strategy);

    expect(registry.getStrategyNames()).toContain('Always');
  });

  it('prevents duplicate registration', () => {
    const registry = new DiscoveryRegistry();
    const strategy = createMockStrategy('Always', true, []);

    registry.register(strategy);

    expect(() => registry.register(strategy)).toThrow('Discovery strategy "Always" is already registered');
  });

  it('removes a registered strategy', () => {
    const registry = new DiscoveryRegistry();
    const strategy = createMockStrategy('Always', true, []);

    registry.register(strategy);
    registry.remove('Always');

    expect(registry.getStrategyNames()).not.toContain('Always');
  });

  it('executes only supporting strategies', async () => {
    const registry = new DiscoveryRegistry();
    const supporting = createMockStrategy('Supporting', true, [
      {
        id: 's-1',
        title: 'Source',
        url: 'https://example.com',
        sourceType: SourceType.OFFICIAL_WEBSITE,
        documentType: DocumentType.BROCHURE,
        confidence: Confidence.HIGH,
      },
    ]);
    const nonSupporting = createMockStrategy('NonSupporting', false, [
      {
        id: 's-2',
        title: 'Source',
        url: 'https://ignored.example.com',
        sourceType: SourceType.OFFICIAL_WEBSITE,
        documentType: DocumentType.BROCHURE,
        confidence: Confidence.LOW,
      },
    ]);

    registry.register(supporting);
    registry.register(nonSupporting);

    const results = await registry.executeAll(createCollege());

    expect(results.has('Supporting')).toBe(true);
    expect(results.has('NonSupporting')).toBe(false);
    expect(results.get('Supporting')).toHaveLength(1);
  });
});
