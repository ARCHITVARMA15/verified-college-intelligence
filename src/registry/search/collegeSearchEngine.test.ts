import { describe, it, expect } from 'vitest';
import type { CollegeIdentity } from '../models/collegeIdentity.js';
import { CollegeStatus } from '../models/collegeStatus.js';
import { CollegeSearchEngine } from './collegeSearchEngine.js';

const createIdentity = (overrides?: Partial<CollegeIdentity>): CollegeIdentity => ({
  id: 'test',
  officialName: 'Pune Institute of Technology',
  shortName: 'PIT',
  aliases: ['PIT Pune'],
  knownDomains: ['pit.edu.in'],
  officialWebsite: 'https://pit.edu.in/',
  city: 'Pune',
  district: 'Pune',
  state: 'Maharashtra',
  university: 'Pune University',
  collegeType: 'private',
  autonomous: true,
  knownKeywords: ['pune', 'technology'],
  status: CollegeStatus.ACTIVE,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('CollegeSearchEngine', () => {
  it('is case-insensitive', () => {
    const engine = new CollegeSearchEngine();
    const college = createIdentity();

    const results = engine.search([college], 'PUNE');

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('test');
  });

  it('matches partial tokens', () => {
    const engine = new CollegeSearchEngine();
    const college = createIdentity();

    const results = engine.search([college], 'tech');

    expect(results).toHaveLength(1);
  });

  it('matches aliases', () => {
    const engine = new CollegeSearchEngine();
    const college = createIdentity();

    const results = engine.search([college], 'PIT Pune');

    expect(results).toHaveLength(1);
  });

  it('ignores punctuation', () => {
    const engine = new CollegeSearchEngine();
    const college = createIdentity();

    const results = engine.search([college], 'pune institute, of technology!');

    expect(results).toHaveLength(1);
  });

  it('returns unique results when multiple tokens match', () => {
    const engine = new CollegeSearchEngine();
    const college = createIdentity();

    const results = engine.search([college], 'pune technology pit');

    expect(results).toHaveLength(1);
  });
});
