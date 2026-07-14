import type { SourceType, Confidence } from './enums.js';

/**
 * Represents an authoritative source from which official college data is obtained.
 */
export interface Source {
  /** Unique identifier for the source. */
  readonly id: string;

  /** Category of the source. */
  type: SourceType;

  /** Canonical URL where the source document or page is located. */
  officialUrl: string;

  /** Organization that published the source (e.g. DTE Maharashtra, college name). */
  organization?: string;

  /** Academic or admission year the source relates to. */
  year: number;

  /** Confidence assigned to the source based on authority and freshness. */
  confidence: Confidence;
}
