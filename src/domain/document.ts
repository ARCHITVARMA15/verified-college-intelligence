import type { DocumentType, DocumentStatus } from './enums.js';

/**
 * Represents an official document discovered or downloaded by VCIE.
 */
export interface Document {
  /** Unique identifier for the document. */
  readonly id: string;

  /** Human-readable title of the document. */
  title: string;

  /** Classification of the document contents. */
  documentType: DocumentType;

  /** Public URL where the PDF or page can be fetched. */
  pdfUrl: string;

  /** Local filesystem path after download, if persisted. */
  localPath?: string;

  /** Academic or admission year the document relates to. */
  year: number;

  /** SHA-256 checksum of the downloaded file for integrity verification. */
  sha256?: string;

  /** Current processing lifecycle state. */
  status: DocumentStatus;

  /** Identifier of the {@link Source} from which this document originated. */
  sourceId: string;

  /** Identifier of the {@link College} this document relates to, if known. */
  collegeId: string;

  /** Timestamp when the document was downloaded. */
  downloadedAt?: Date;

  /** Timestamp when the document finished processing. */
  processedAt?: Date;
}
