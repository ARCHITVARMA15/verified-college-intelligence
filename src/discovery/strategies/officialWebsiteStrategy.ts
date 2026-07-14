import type { College } from '../../domain/college.js';
import { Confidence, DocumentType, SourceType } from '../../domain/enums.js';
import type { DiscoveryStrategy } from '../interfaces/discoveryStrategy.js';
import type { CandidateSource } from '../types/candidateSource.js';

/**
 * Mock strategy that discovers candidate sources from a college's official website.
 * All URLs are synthetic and no network calls are made.
 */
export class OfficialWebsiteStrategy implements DiscoveryStrategy {
  getName(): string {
    return 'OfficialWebsiteStrategy';
  }

  supports(_college: College): boolean {
    return true;
  }

  async discover(college: College): Promise<CandidateSource[]> {
    const baseUrl = college.officialWebsite ?? `https://${this.slugify(college.name)}.edu.in`;

    return [
      this.createCandidate(college, 'Official Website', `${baseUrl}/`, DocumentType.BROCHURE),
      this.createCandidate(
        college,
        'Training & Placement',
        `${baseUrl}/training-placement`,
        DocumentType.PLACEMENT_REPORT,
      ),
      this.createCandidate(
        college,
        'Admissions',
        `${baseUrl}/admissions`,
        DocumentType.ADMISSION_NOTIFICATION,
      ),
    ];
  }

  private slugify(name: string): string {
    return name.toLowerCase().replaceAll(/\s+/g, '-');
  }

  private createCandidate(
    college: College,
    title: string,
    url: string,
    documentType: DocumentType,
  ): CandidateSource {
    return {
      id: `${this.getName()}-${college.id}-${documentType}`,
      title,
      url,
      sourceType: SourceType.OFFICIAL_WEBSITE,
      documentType,
      year: new Date().getFullYear(),
      confidence: Confidence.HIGH,
      metadata: { discoveredBy: this.getName() },
    };
  }
}
