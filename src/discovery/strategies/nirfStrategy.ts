import type { College } from '../../domain/college.js';
import { Confidence, DocumentType, SourceType } from '../../domain/enums.js';
import type { DiscoveryStrategy } from '../interfaces/discoveryStrategy.js';
import type { CandidateSource } from '../types/candidateSource.js';

/**
 * Mock strategy that discovers NIRF ranking sources for a college.
 * All URLs are synthetic and no network calls are made.
 */
export class NirfStrategy implements DiscoveryStrategy {
  getName(): string {
    return 'NirfStrategy';
  }

  supports(_college: College): boolean {
    return true;
  }

  async discover(college: College): Promise<CandidateSource[]> {
    const normalizedName = this.slugify(college.name);
    const baseUrl = 'https://mock-nirf.example.com';

    return [
      {
        id: `${this.getName()}-${college.id}-ranking`,
        title: 'Engineering Ranking',
        url: `${baseUrl}/engineering/${normalizedName}`,
        sourceType: SourceType.GOVERNMENT_PORTAL,
        documentType: DocumentType.BROCHURE,
        year: new Date().getFullYear(),
        confidence: Confidence.MEDIUM,
        metadata: { discoveredBy: this.getName() },
      },
      {
        id: `${this.getName()}-${college.id}-report`,
        title: 'Engineering Report PDF',
        url: `${baseUrl}/engineering/${normalizedName}/report.pdf`,
        sourceType: SourceType.GOVERNMENT_PORTAL,
        documentType: DocumentType.BROCHURE,
        year: new Date().getFullYear(),
        confidence: Confidence.MEDIUM,
        metadata: { discoveredBy: this.getName() },
      },
    ];
  }

  private slugify(name: string): string {
    return name.toLowerCase().replaceAll(/\s+/g, '-');
  }
}
