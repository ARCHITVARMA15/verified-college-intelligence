import { describe, it, expect } from 'vitest';
import { extractFacts } from './factExtractor.js';
import type { TextDocument } from './factExtractor.js';

const createDoc = (text: string, extension: 'pdf' | 'html' = 'pdf'): TextDocument => ({
  sourceUrl: 'https://example.com/doc',
  sourceFile: 'documents/doc.pdf',
  extension,
  text,
});

describe('extractFacts', () => {
  it('extracts highest package from placement text', () => {
    const facts = extractFacts([
      createDoc('The highest package offered was ₹58 LPA in 2024.'),
    ]);

    expect(facts.highestPackage?.value).toEqual({ amount: 58, unit: 'LPA' });
  });

  it('extracts median and average packages', () => {
    const facts = extractFacts([
      createDoc('Median package was 12 LPA and average package was 15 LPA.'),
    ]);

    expect(facts.medianPackage?.value).toEqual({ amount: 12, unit: 'LPA' });
    expect(facts.averagePackage?.value).toEqual({ amount: 15, unit: 'LPA' });
  });

  it('extracts placement percentage', () => {
    const facts = extractFacts([
      createDoc('The placement percentage for 2024 was 92.4%.'),
    ]);

    expect(facts.placementPercentage?.value).toBe(92.4);
  });

  it('extracts students placed count', () => {
    const facts = extractFacts([
      createDoc('245 students were placed in the 2024 placement season.'),
    ]);

    expect(facts.studentsPlaced?.value).toBe(245);
  });

  it('extracts NIRF rank with year', () => {
    const facts = extractFacts([
      createDoc('NIRF ranking 2024: 145. NIRF rank 150 in 2023.'),
    ]);

    expect(facts.nirfRanking?.value).toEqual({ year: 2024, rank: 145 });
  });

  it('extracts recruiter list from a section', () => {
    const text = `Our Recruiters
TCS
Infosys
Google, Microsoft | Amazon`;
    const facts = extractFacts([createDoc(text)]);

    expect(facts.recruiters?.value).toEqual(
      expect.arrayContaining(['TCS', 'Infosys', 'Google', 'Microsoft', 'Amazon']),
    );
  });

  it('extracts accreditation mentions', () => {
    const facts = extractFacts([
      createDoc('The institute is NBA accredited, NAAC A+ grade, autonomous, UGC and AICTE approved.'),
    ]);

    expect(facts.accreditation.nba?.value).toBe(true);
    expect(facts.accreditation.naac?.value).toBe('A+');
    expect(facts.accreditation.autonomous?.value).toBe(true);
    expect(facts.accreditation.ugc?.value).toBe(true);
    expect(facts.accreditation.aicte?.value).toBe(true);
  });

  it('converts crore values to LPA', () => {
    const facts = extractFacts([
      createDoc('The highest CTC was 1.2 Crore.'),
    ]);

    expect(facts.highestPackage?.value).toEqual({ amount: 120, unit: 'LPA' });
  });
});
