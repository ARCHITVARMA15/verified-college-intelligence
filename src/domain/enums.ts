/**
 * Origin category for a data source.
 */
export enum SourceType {
  OFFICIAL_WEBSITE = 'OFFICIAL_WEBSITE',
  GOVERNMENT_PORTAL = 'GOVERNMENT_PORTAL',
  UNIVERSITY_PORTAL = 'UNIVERSITY_PORTAL',
  PRESS_RELEASE = 'PRESS_RELEASE',
  OTHER = 'OTHER',
}

/**
 * Confidence level assigned to a data point or source based on provenance and verification.
 */
export enum Confidence {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  UNVERIFIED = 'UNVERIFIED',
}

/**
 * Lifecycle state of a verification review.
 */
export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

/**
 * Processing lifecycle of an official document.
 */
export enum DocumentStatus {
  DISCOVERED = 'DISCOVERED',
  DOWNLOADED = 'DOWNLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

/**
 * Execution lifecycle of a background job.
 */
export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Classification of official documents that VCIE may ingest.
 */
export enum DocumentType {
  BROCHURE = 'BROCHURE',
  CUTOFF = 'CUTOFF',
  FEE_STRUCTURE = 'FEE_STRUCTURE',
  PLACEMENT_REPORT = 'PLACEMENT_REPORT',
  SEAT_MATRIX = 'SEAT_MATRIX',
  MERIT_LIST = 'MERIT_LIST',
  ADMISSION_NOTIFICATION = 'ADMISSION_NOTIFICATION',
  OTHER = 'OTHER',
}
