import { describe, it, expect } from 'vitest';
import type { CollegeIdentity } from '../../registry/models/collegeIdentity.js';
import { CollegeStatus } from '../../registry/models/collegeStatus.js';
import { DocumentType, SourceType } from '../../domain/enums.js';
import { NirfStrategy } from './nirfStrategy.js';

const createCollege = (overrides?: Partial<CollegeIdentity>): CollegeIdentity => ({
  id: 'college-1',
  officialName: 'Test College of Engineering',
  shortName: 'TCE',
  aliases: [],
  knownDomains: ['tce.edu.in'],
  city: 'Pune',
  district: 'Pune',
  state: 'Maharashtra',
  officialWebsite: 'https://tce.edu.in',
  university: 'Test University',
  collegeType: 'private',
  autonomous: true,
  knownKeywords: [],
  status: CollegeStatus.ACTIVE,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

describe('NirfStrategy', () => {
  it('returns its name', () => {
    const strategy = new NirfStrategy();
    expect(strategy.getName()).toBe('NirfStrategy');
  });

  it('supports every college', () => {
    const strategy = new NirfStrategy();
    expect(strategy.supports(createCollege())).toBe(true);
  });

  it('discovers two candidate sources from the NIRF portal', async () => {
    const strategy = new NirfStrategy();
    const candidates = await strategy.discover(createCollege());

    expect(candidates).toHaveLength(2);
    expect(candidates.map((c) => c.title)).toEqual(['Engineering Ranking', 'Engineering Report PDF']);
    expect(candidates.every((c) => c.sourceType === SourceType.GOVERNMENT_PORTAL)).toBe(true);
    expect(candidates.every((c) => c.url.startsWith('https://mock-nirf.example.com'))).toBe(true);
    expect(candidates.every((c) => c.documentType === DocumentType.BROCHURE)).toBe(true);
  });
});
