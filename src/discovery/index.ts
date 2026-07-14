export type { DiscoveryStrategy } from './interfaces/discoveryStrategy.js';

export type { CandidateSource, DiscoveryError, DiscoveryResult } from './types/index.js';

export { DiscoveryRegistry } from './registry/discoveryRegistry.js';
export { DiscoveryService } from './services/discoveryService.js';

export { OfficialWebsiteStrategy } from './strategies/officialWebsiteStrategy.js';
export {
  OfficialWebsiteDiscoveryStrategy,
  type HtmlHttpClient,
} from './strategies/officialWebsiteDiscoveryStrategy.js';
export { NirfStrategy } from './strategies/nirfStrategy.js';

export { normalizeUrl } from './utils/urlNormalizer.js';
export { mergeDuplicateCandidates } from './utils/duplicateDetector.js';
