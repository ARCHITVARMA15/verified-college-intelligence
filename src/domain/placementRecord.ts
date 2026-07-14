import type { Confidence } from './enums.js';

/**
 * Represents placement statistics extracted from an official document for a college and year.
 */
export interface PlacementRecord {
  /** Unique identifier for the placement record. */
  readonly id: string;

  /** Identifier of the {@link College} this record belongs to. */
  collegeId: string;

  /** Academic year the placement data corresponds to. */
  year: number;

  /** Highest salary package offered, in local currency units. */
  highestPackage?: number;

  /** Average salary package offered, in local currency units. */
  averagePackage?: number;

  /** Median salary package offered, in local currency units. */
  medianPackage?: number;

  /** Percentage of eligible students placed. */
  placementPercentage?: number;

  /** Number of students placed. */
  studentsPlaced?: number;

  /** Number of students pursuing higher studies. */
  higherStudies?: number;

  /** Identifiers of {@link Recruiter} entities associated with this record. */
  topRecruiters: readonly string[];

  /** Identifier of the {@link Document} from which this record was extracted. */
  sourceDocument: string;

  /** Page number in the source document where the data was found. */
  pageNumber?: number;

  /** Confidence level assigned to the extracted data. */
  confidence: Confidence;

  /** Whether the record has passed verification review. */
  verified: boolean;

  /** Timestamp when the record was verified. */
  verifiedAt?: Date;
}
