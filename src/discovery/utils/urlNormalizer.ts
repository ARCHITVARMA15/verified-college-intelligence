/**
 * Normalizes a URL so that equivalent addresses collapse to the same string.
 *
 * Normalization rules:
 * - Lowercase protocol and hostname
 * - Remove trailing slashes from the pathname
 * - Strip default ports (80 for http, 443 for https)
 * - Remove the fragment/hash
 * - Sort query parameters alphabetically
 */
export const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);

    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.hash = '';
    parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/';

    if (parsed.search) {
      const params = new URLSearchParams(parsed.search);
      params.sort();
      parsed.search = params.toString() ? `?${params.toString()}` : '';
    }

    if (
      (parsed.protocol === 'http:' && parsed.port === '80') ||
      (parsed.protocol === 'https:' && parsed.port === '443')
    ) {
      parsed.port = '';
    }

    return parsed.toString();
  } catch {
    return url.trim().toLowerCase();
  }
};
