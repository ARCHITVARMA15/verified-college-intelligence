/**
 * Ownership and aid classification for a college.
 */
export type CollegeType = 'government' | 'private' | 'aided';

/**
 * Discriminator for background job payloads.
 */
export type JobType = 'download' | 'process' | 'verify' | 'sync' | 'cleanup';
