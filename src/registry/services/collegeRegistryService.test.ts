import { describe, it, expect } from 'vitest';
import type { CollegeIdentity } from '../models/collegeIdentity.js';
import { CollegeStatus } from '../models/collegeStatus.js';
import { collegeSeedData } from '../seed/collegeSeedData.js';
import { CollegeRegistryService } from './collegeRegistryService.js';

const createIdentity = (overrides?: Partial<CollegeIdentity>): CollegeIdentity => ({
  id: 'test-college',
  officialName: 'Test College of Engineering',
  shortName: 'TCE',
  aliases: ['TCE', 'Test Engineering'],
  knownDomains: ['test.edu.in'],
  officialWebsite: 'https://test.edu.in/',
  city: 'Pune',
  district: 'Pune',
  state: 'Maharashtra',
  university: 'Test University',
  collegeType: 'private',
  autonomous: true,
  knownKeywords: ['test', 'engineering'],
  status: CollegeStatus.ACTIVE,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('CollegeRegistryService', () => {
  it('registers colleges and returns all of them', () => {
    const registry = new CollegeRegistryService();
    registry.register(createIdentity({ id: 'c-1', officialName: 'College One' }));
    registry.register(createIdentity({ id: 'c-2', officialName: 'College Two' }));

    expect(registry.getAll()).toHaveLength(2);
  });

  it('finds a college by id', () => {
    const registry = new CollegeRegistryService();
    registry.register(createIdentity());

    const found = registry.findById('test-college');

    expect(found?.officialName).toBe('Test College of Engineering');
  });

  it('finds a college by official name case-insensitively', () => {
    const registry = new CollegeRegistryService();
    registry.register(createIdentity());

    const found = registry.findByOfficialName('  test college of ENGINEERING  ');

    expect(found?.id).toBe('test-college');
  });

  it('finds a college by alias', () => {
    const registry = new CollegeRegistryService();
    registry.register(createIdentity());

    const found = registry.findByAlias('test engineering');

    expect(found?.id).toBe('test-college');
  });

  it('finds a college by domain', () => {
    const registry = new CollegeRegistryService();
    registry.register(createIdentity());

    const found = registry.findByDomain('https://www.test.edu.in/about');

    expect(found?.id).toBe('test-college');
  });

  it('performs partial normalized search', () => {
    const registry = new CollegeRegistryService();
    for (const college of collegeSeedData) {
      registry.register(college);
    }

    const results = registry.search('mumbai autonomous');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((c) => c.city === 'Mumbai' && c.autonomous)).toBe(true);
  });

  it('prevents duplicate id registration', () => {
    const registry = new CollegeRegistryService();
    registry.register(createIdentity());

    expect(() => registry.register(createIdentity())).toThrow(
      'College with id "test-college" already exists',
    );
  });

  it('prevents duplicate official name registration', () => {
    const registry = new CollegeRegistryService();
    registry.register(createIdentity());

    expect(() =>
      registry.register(createIdentity({ id: 'different-id' })),
    ).toThrow('College with official name "Test College of Engineering" already exists');
  });
});
