import type { VerificationStatus } from './enums.js';

/**
 * Represents a review decision made on a domain entity before it is accepted as verified data.
 */
export interface VerificationRecord {
  /** Unique identifier for the verification record. */
  readonly id: string;

  /**
   * Name of the domain entity being verified.
   * Examples: 'document', 'placementRecord', 'college'.
   */
  entity: string;

  /** Identifier of the entity instance under review. */
  entityId: string;

  /** Identifier of the reviewer or system that made the decision. */
  reviewer?: string;

  /** Outcome of the verification review. */
  status: VerificationStatus;

  /** Optional human-readable notes about the decision. */
  comments?: string;

  /** Timestamp when the verification decision was recorded. */
  verifiedAt?: Date;
}
