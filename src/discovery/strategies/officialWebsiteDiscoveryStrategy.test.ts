import { describe, it, expect, vi } from 'vitest';
import type { CollegeIdentity } from '../../registry/models/collegeIdentity.js';
import { CollegeStatus } from '../../registry/models/collegeStatus.js';
import { Confidence, DocumentType } from '../../domain/enums.js';
import type { HtmlHttpClient } from './officialWebsiteDiscoveryStrategy.js';
import { OfficialWebsiteDiscoveryStrategy } from './officialWebsiteDiscoveryStrategy.js';

const createDjsce = (overrides?: Partial<CollegeIdentity>): CollegeIdentity => ({
  id: 'djsce-mumbai',
  officialName: 'Dwarkadas J. Sanghvi College of Engineering',
  shortName: 'DJSCE',
  aliases: [],
  knownDomains: ['djsce.ac.in'],
  officialWebsite: 'https://www.djsce.ac.in/',
  city: 'Mumbai',
  district: 'Mumbai',
  state: 'Maharashtra',
  university: 'University of Mumbai',
  collegeType: 'private',
  autonomous: true,
  knownKeywords: [],
  status: CollegeStatus.ACTIVE,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const sampleHtml = `
  <html>
    <body>
      <a href="/placement">Training & Placement</a>
      <a href="/training-placement.pdf">T&P Report PDF</a>
      <a href="https://external.example.com/nirf">NIRF Report</a>
      <a href="https://external.example.com/naac.pdf">NAAC Report PDF</a>
      <a href="/about">About Us</a>
      <a href="mailto:admin@djsce.ac.in">Contact</a>
      <a href="/naac">NAAC Accreditation</a>
      <a href="/downloads">Downloads</a>
    </body>
  </html>
`;

const createMockHttpClient = (html: string): HtmlHttpClient => ({
  get: vi.fn().mockResolvedValue({ data: html }),
});

describe('OfficialWebsiteDiscoveryStrategy', () => {
  it('returns its name', () => {
    const httpClient = createMockHttpClient('');
    const strategy = new OfficialWebsiteDiscoveryStrategy(httpClient);

    expect(strategy.getName()).toBe('OfficialWebsiteDiscoveryStrategy');
  });

  it('supports only DJSCE', () => {
    const httpClient = createMockHttpClient('');
    const strategy = new OfficialWebsiteDiscoveryStrategy(httpClient);

    expect(strategy.supports(createDjsce())).toBe(true);
    expect(
      strategy.supports(
        createDjsce({ id: 'other', shortName: 'OTHER', officialWebsite: 'https://other.ac.in/' }),
      ),
    ).toBe(false);
  });

  it('discovers keyword-matched links from homepage HTML', async () => {
    const httpClient = createMockHttpClient(sampleHtml);
    const strategy = new OfficialWebsiteDiscoveryStrategy(httpClient);

    const candidates = await strategy.discover(createDjsce());

    expect(candidates).toHaveLength(6);
    expect(candidates.map((c) => c.title)).toEqual(
      expect.arrayContaining([
        'Training & Placement',
        'T&P Report PDF',
        'NIRF Report',
        'NAAC Report PDF',
        'NAAC Accreditation',
        'Downloads',
      ]),
    );
    expect(httpClient.get).toHaveBeenCalledWith('https://www.djsce.ac.in/');
  });

  it('assigns HIGH confidence to PDF links', async () => {
    const httpClient = createMockHttpClient(sampleHtml);
    const strategy = new OfficialWebsiteDiscoveryStrategy(httpClient);

    const candidates = await strategy.discover(createDjsce());
    const pdfCandidates = candidates.filter((c) => c.url.endsWith('.pdf'));

    expect(pdfCandidates.length).toBeGreaterThan(0);
    expect(pdfCandidates.every((c) => c.confidence === Confidence.HIGH)).toBe(true);
  });

  it('assigns MEDIUM confidence to internal official pages', async () => {
    const httpClient = createMockHttpClient(sampleHtml);
    const strategy = new OfficialWebsiteDiscoveryStrategy(httpClient);

    const candidates = await strategy.discover(createDjsce());
    const placement = candidates.find((c) => c.title === 'Training & Placement');

    expect(placement?.confidence).toBe(Confidence.MEDIUM);
  });

  it('assigns LOW confidence to external non-PDF domains', async () => {
    const httpClient = createMockHttpClient(sampleHtml);
    const strategy = new OfficialWebsiteDiscoveryStrategy(httpClient);

    const candidates = await strategy.discover(createDjsce());
    const external = candidates.find((c) => c.title === 'NIRF Report');

    expect(external?.confidence).toBe(Confidence.LOW);
  });

  it('guesses document types from link context', async () => {
    const httpClient = createMockHttpClient(sampleHtml);
    const strategy = new OfficialWebsiteDiscoveryStrategy(httpClient);

    const candidates = await strategy.discover(createDjsce());
    const placement = candidates.find((c) => c.title === 'Training & Placement');
    const naac = candidates.find((c) => c.title === 'NAAC Accreditation');

    expect(placement?.documentType).toBe(DocumentType.PLACEMENT_REPORT);
    expect(naac?.documentType).toBe(DocumentType.BROCHURE);
  });

  it('normalizes and deduplicates discovered URLs', async () => {
    const html = `
      <html>
        <body>
          <a href="/placement">Placement</a>
          <a href="/placement/">Placement</a>
        </body>
      </html>
    `;
    const httpClient = createMockHttpClient(html);
    const strategy = new OfficialWebsiteDiscoveryStrategy(httpClient);

    const candidates = await strategy.discover(createDjsce());

    expect(candidates).toHaveLength(1);
  });

  it('skips non-http links', async () => {
    const html = `
      <html>
        <body>
          <a href="mailto:admin@djsce.ac.in">Email</a>
          <a href="tel:+1234567890">Call</a>
          <a href="javascript:void(0)">Click</a>
          <a href="/placement">Placement</a>
        </body>
      </html>
    `;
    const httpClient = createMockHttpClient(html);
    const strategy = new OfficialWebsiteDiscoveryStrategy(httpClient);

    const candidates = await strategy.discover(createDjsce());

    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.title).toBe('Placement');
  });
});
