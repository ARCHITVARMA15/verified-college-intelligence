import type { JobStatus } from './enums.js';
import type { JobType } from './types.js';

/**
 * Represents a unit of background work executed by the VCIE worker layer.
 */
export interface Job {
  /** Unique identifier for the job. */
  readonly id: string;

  /** Discriminator that determines the job handler and payload shape. */
  jobType: JobType;

  /** Current execution state of the job. */
  status: JobStatus;

  /** Timestamp when the job started execution. */
  startedAt?: Date;

  /** Timestamp when the job finished execution. */
  finishedAt?: Date;

  /** Human-readable failure description when status is FAILED. */
  errorMessage?: string;
}
