/**
 * Represents a company that recruits from colleges tracked by VCIE.
 */
export interface Recruiter {
  /** Unique identifier for the recruiter. */
  readonly id: string;

  /** Official or commonly known company name. */
  name: string;

  /** Industry category or sector. */
  category?: string;

  /** Academic years in which the recruiter visited the campus. */
  yearsVisited: readonly number[];
}
