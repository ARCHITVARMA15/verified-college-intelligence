import { describe, it, expect } from 'vitest';
import type { CollegeIdentity } from '../../registry/models/collegeIdentity.js';
import { CollegeStatus } from '../../registry/models/collegeStatus.js';
import { Confidence, DocumentType, SourceType } from '../../domain/enums.js';
import type { DiscoveryStrategy } from '../interfaces/discoveryStrategy.js';
import type { CandidateSource } from '../types/candidateSource.js';
import { DiscoveryRegistry } from './discoveryRegistry.js';

const createCollege = (): CollegeIdentity => ({
  id: 'college-1',
  officialName: 'Test College',
  shortName: 'TC',
  aliases: [],
  knownDomains: ['test.edu.in'],
  city: 'Pune',
  district: 'Pune',
  state: 'Maharashtra',
  officialWebsite: 'https://test.edu.in/',
  university: 'Test University',
  collegeType: 'private',
  autonomous: false,
  knownKeywords: [],
  status: CollegeStatus.ACTIVE,
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
