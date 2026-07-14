import type { CollegeType } from '../../domain/types.js';
import type { CollegeStatus } from './collegeStatus.js';

/**
 * Canonical identity record for an engineering college.
 *
 * This type is intentionally separate from enriched profile or placement data.
 * It defines the minimum information required to recognize and reference a college
 * across every VCIE module.
 */
export interface CollegeIdentity {
  /** Stable, unique identifier for the college across the system. */
  readonly id: string;

  /** Full official name of the college. */
  officialName: string;

  /** Commonly used short name or abbreviation. */
  shortName: string;

  /** Alternative names, abbreviations and common misspellings used for matching. */
  aliases: readonly string[];

  /** Domains officially associated with the college, used to attribute sources. */
  knownDomains: readonly string[];

  /** Official website URL. */
  officialWebsite: string;

  /** City where the main campus is located. */
  city: string;

  /** District within the state. */
  district: string;

  /** State where the college is located. */
  state: string;

  /** Affiliating or parent university. */
  university: string;

  /** Ownership and aid classification. */
  collegeType: CollegeType;

  /** Whether the college is an autonomous institution. */
  autonomous: boolean;

  /** Minority status, if applicable. */
  minorityStatus?: string;

  /** Keywords used to improve search recall. */
  knownKeywords: readonly string[];

  /** Lifecycle status of the registry entry. */
  status: CollegeStatus;

  /** Timestamp when the record was created. */
  readonly createdAt: Date;

  /** Timestamp when the record was last updated. */
  updatedAt: Date;
}
