import type { CollegeType } from './types.js';

/**
 * Represents an engineering college whose data is collected, verified and served by VCIE.
 */
export interface College {
  /** Unique identifier for the college. */
  readonly id: string;

  /** Official full name of the college. */
  name: string;

  /** Short or commonly used abbreviation. */
  shortName?: string;

  /** City where the college is located. */
  city: string;

  /** District within the state. */
  district: string;

  /** State where the college is located. */
  state: string;

  /** Official website URL of the college. */
  officialWebsite?: string;

  /** Ownership and aid type of the college. */
  collegeType: CollegeType;

  /** Whether the college is an autonomous institution. */
  autonomous: boolean;

  /** Minority status, if applicable. */
  minorityStatus?: string;

  /** Affiliating university. */
  university?: string;

  /** NIRF engineering ranking, if available. */
  nirfRank?: number;

  /** NAAC accreditation grade. */
  naacGrade?: string;

  /** Whether the college holds NBA accreditation. */
  nbaAccredited: boolean;

  /** Timestamp when the record was created. */
  readonly createdAt: Date;

  /** Timestamp when the record was last updated. */
  updatedAt: Date;
}
