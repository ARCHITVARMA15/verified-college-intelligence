import { describe, it, expect } from 'vitest';
import type { College } from '../../domain/college.js';
import { Confidence } from '../../domain/enums.js';
import type { DiscoveryStrategy } from '../interfaces/discoveryStrategy.js';
import { DiscoveryRegistry } from '../registry/discoveryRegistry.js';
import { OfficialWebsiteStrategy } from '../strategies/officialWebsiteStrategy.js';
import { NirfStrategy } from '../strategies/nirfStrategy.js';
import { DiscoveryService } from './discoveryService.js';

const createCollege = (overrides?: Partial<College>): College => ({
  id: 'college-1',
  name: 'Test College of Engineering',
  city: 'Pune',
  district: 'Pune',
  state: 'Maharashtra',
  officialWebsite: 'https://tce.edu.in',
  collegeType: 'private',
  autonomous: true,
  nbaAccredited: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

describe('DiscoveryService', () => {
  it('returns an empty result when no strategies are registered', async () => {
    const registry = new DiscoveryRegistry();
    const service = new DiscoveryService(registry);

    const result = await service.discover(createCollege());

    expect(result.collegeId).toBe('college-1');
    expect(result.candidateSources).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('aggregates, deduplicates and sorts candidates by confidence', async () => {
    const registry = new DiscoveryRegistry();
    registry.register(new OfficialWebsiteStrategy());
    registry.register(new NirfStrategy());
    const service = new DiscoveryService(registry);

    const result = await service.discover(createCollege());

    expect(result.candidateSources.length).toBeGreaterThan(0);
    expect(result.candidateSources[0]?.confidence).toBe(Confidence.HIGH);
    expect(result.strategy).toBe('DiscoveryService');
    expect(result.startedAt.getTime()).toBeLessThanOrEqual(result.finishedAt.getTime());
  });

  it('records an error when a strategy fails', async () => {
    const registry = new DiscoveryRegistry();
    const failingStrategy: DiscoveryStrategy = {
      getName: () => 'Failing',
      supports: () => true,
      discover: async () => {
        throw new Error('Network failure');
      },
    };
    registry.register(failingStrategy);
    const service = new DiscoveryService(registry);

    const result = await service.discover(createCollege());

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.message).toBe('Network failure');
  });
});
