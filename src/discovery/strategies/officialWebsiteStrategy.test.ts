import { describe, it, expect } from 'vitest';
import type { CollegeIdentity } from '../../registry/models/collegeIdentity.js';
import { CollegeStatus } from '../../registry/models/collegeStatus.js';
import { DocumentType, SourceType } from '../../domain/enums.js';
import { OfficialWebsiteStrategy } from './officialWebsiteStrategy.js';

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

describe('OfficialWebsiteStrategy', () => {
  it('returns its name', () => {
    const strategy = new OfficialWebsiteStrategy();
    expect(strategy.getName()).toBe('OfficialWebsiteStrategy');
  });

  it('supports every college', () => {
    const strategy = new OfficialWebsiteStrategy();
    expect(strategy.supports(createCollege())).toBe(true);
  });

  it('discovers three candidate sources from the official website', async () => {
    const strategy = new OfficialWebsiteStrategy();
    const candidates = await strategy.discover(createCollege());

    expect(candidates).toHaveLength(3);
    expect(candidates.map((c) => c.title)).toEqual([
      'Official Website',
      'Training & Placement',
      'Admissions',
    ]);
    expect(candidates.every((c) => c.sourceType === SourceType.OFFICIAL_WEBSITE)).toBe(true);
    expect(candidates.every((c) => c.url.startsWith('https://tce.edu.in'))).toBe(true);
    expect(candidates[0]?.documentType).toBe(DocumentType.BROCHURE);
    expect(candidates[1]?.documentType).toBe(DocumentType.PLACEMENT_REPORT);
    expect(candidates[2]?.documentType).toBe(DocumentType.ADMISSION_NOTIFICATION);
  });

  it('falls back to a generated URL when official website is missing', async () => {
    const strategy = new OfficialWebsiteStrategy();
    const candidates = await strategy.discover(createCollege({ officialWebsite: undefined }));

    expect(candidates[0]?.url).toBe('https://test-college-of-engineering.edu.in/');
  });
});
