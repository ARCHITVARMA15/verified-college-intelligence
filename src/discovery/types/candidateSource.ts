import type { SourceType, DocumentType, Confidence } from '../../domain/enums.js';

/**
 * A potential data source discovered for a college before any download or verification.
 */
export interface CandidateSource {
  /** Unique identifier for the candidate source. */
  readonly id: string;

  /** Human-readable title describing the source. */
  title: string;

  /** Canonical URL where the source can be fetched. */
  url: string;

  /** Origin category of the source. */
  sourceType: SourceType;

  /** Classification of the document this source points to. */
  documentType: DocumentType;

  /** Academic or admission year the source relates to, if known. */
  year?: number;

  /** Confidence in the relevance and authority of the source. */
  confidence: Confidence;

  /** Strategy-specific metadata such as page numbers, discovery context or source tags. */
  metadata?: Record<string, unknown>;
}
