/**
 * Normalizes free-form text for case-insensitive, punctuation-insensitive comparison.
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extracts the normalized hostname from a URL or bare domain string.
 */
export const extractDomain = (input: string): string => {
  try {
    const url = new URL(input);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return input.replace(/^www\./, '').toLowerCase();
  }
};
