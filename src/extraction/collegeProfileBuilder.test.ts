import { describe, it, expect } from 'vitest';
import type { ExtractedFacts } from './factExtractor.js';
import { buildCollegeProfile } from './collegeProfileBuilder.js';

describe('buildCollegeProfile', () => {
  it('combines extracted facts into a structured profile', () => {
    const facts: ExtractedFacts = {
      highestPackage: {
        value: { amount: 58, unit: 'LPA' },
        context: 'highest package ₹58 LPA',
        confidence: 'HIGH',
        reason: 'Matched official placement PDF',
        sourceUrl: 'https://example.com/placement.pdf',
        sourceFile: 'documents/placement.pdf',
      },
      placementPercentage: {
        value: 94,
        context: 'placement percentage 94%',
        confidence: 'HIGH',
        reason: 'Matched placement percentage',
        sourceUrl: 'https://example.com/placement.pdf',
        sourceFile: 'documents/placement.pdf',
      },
      accreditation: {
        naac: {
          value: 'A+',
          context: 'NAAC A+',
          confidence: 'HIGH',
          reason: 'Matched NAAC mention',
          sourceUrl: 'https://example.com/naac.pdf',
          sourceFile: 'documents/naac.pdf',
        },
      },
      recruiters: {
        value: ['TCS', 'Infosys'],
        context: 'Recruiters',
        confidence: 'MEDIUM',
        reason: 'Parsed recruiter list',
        sourceUrl: 'https://example.com/recruiters.html',
        sourceFile: 'documents/recruiters.html',
      },
    };

    const profile = buildCollegeProfile({
      collegeName: 'DJSCE',
      sourceFiles: ['documents/placement.pdf'],
      facts,
    });

    expect(profile.college).toBe('DJSCE');
    expect(profile.placements.highestPackage?.value).toEqual({ value: 58, unit: 'LPA' });
    expect(profile.placements.placementPercentage?.value).toBe(94);
    expect(profile.accreditation.naac?.value).toBe('A+');
    expect(profile.recruiters.value).toEqual(['TCS', 'Infosys']);
    expect(profile.metadata.sourceFiles).toEqual(['documents/placement.pdf']);
  });

  it('provides an empty recruiter list when none were found', () => {
    const facts: ExtractedFacts = { accreditation: {} };

    const profile = buildCollegeProfile({
      collegeName: 'DJSCE',
      sourceFiles: [],
      facts,
    });

    expect(profile.recruiters.value).toEqual([]);
    expect(profile.recruiters.confidence).toBe('LOW');
  });
});
