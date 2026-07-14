export type { LoadedDocument, CollegeMetadata } from './documentLoader.js';
export { loadDocuments, loadMetadata } from './documentLoader.js';

export { extractTextFromHtml } from './htmlExtractor.js';
export { extractTextFromPdf } from './pdfExtractor.js';
export { normalizeText } from './textNormalizer.js';

export { extractFacts } from './factExtractor.js';
export type { ExtractedFacts, TextDocument } from './factExtractor.js';

export { buildCollegeProfile } from './collegeProfileBuilder.js';
export type { BuildProfileInput } from './collegeProfileBuilder.js';

export type { VerifiedFact, CollegeProfile } from './verification.js';
