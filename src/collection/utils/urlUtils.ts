/**
 * Resolves a possibly relative URL against a base URL.
 */
export const resolveUrl = (href: string, baseUrl: string): string | undefined => {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return undefined;
  }
};

/**
 * Returns the domain of a URL, stripping www.
 */
export const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
};

/**
 * Checks whether a URL belongs to one of the allowed official domains.
 */
export const isAllowedDomain = (url: string, allowedDomains: readonly string[]): boolean => {
  const urlDomain = getDomain(url);
  return allowedDomains.some((domain) => {
    const normalized = domain.replace(/^www\./, '').toLowerCase();
    return urlDomain === normalized || urlDomain.endsWith(`.${normalized}`);
  });
};

const INVALID_PROTOCOLS = ['mailto:', 'tel:', 'javascript:', 'data:', 'file:', '#'];

/**
 * Checks whether a URL can be fetched over HTTP.
 */
export const isHttpUrl = (url: string): boolean => {
  return (
    (url.startsWith('http://') || url.startsWith('https://')) &&
    !INVALID_PROTOCOLS.some((protocol) => url.toLowerCase().startsWith(protocol))
  );
};
