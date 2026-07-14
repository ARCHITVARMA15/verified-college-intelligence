/**
 * Error context captured when a discovery strategy fails during execution.
 */
export interface DiscoveryError {
  /** Name of the strategy that produced the error. */
  strategy: string;

  /** Human-readable failure description. */
  message: string;
}
