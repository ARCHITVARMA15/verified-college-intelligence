/**
 * Normalizes extracted text for deterministic downstream processing.
 *
 * - Collapses runs of whitespace into a single space.
 * - Preserves paragraph boundaries (double newlines).
 * - Normalizes Unicode to NFKC so currency symbols and punctuation are uniform.
 */
export const normalizeText = (text: string): string => {
  return text
    .normalize('NFKC')
    .replace(/\u00A0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
