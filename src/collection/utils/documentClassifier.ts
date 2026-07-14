export const DISCOVERY_KEYWORDS = [
  'placement',
  'training',
  'career',
  'recruitment',
  'nirf',
  'mandatory',
  'disclosure',
  'naac',
  'ssr',
  'iqac',
  'annual report',
  'aqar',
  'downloads',
  'pdf',
];

/**
 * Returns true if the URL or anchor text matches any discovery keyword.
 */
export const matchesKeyword = (text: string, url: string): boolean => {
  const searchable = `${text} ${url}`.toLowerCase();
  return DISCOVERY_KEYWORDS.some((keyword) => searchable.includes(keyword));
};

/**
 * Guesses the document category from URL and anchor text.
 */
export const classifyDocument = (text: string, url: string): string => {
  const combined = `${text} ${url}`.toLowerCase();

  if (
    combined.includes('placement') ||
    combined.includes('training') ||
    combined.includes('career') ||
    combined.includes('recruitment')
  ) {
    return 'PLACEMENT';
  }

  if (combined.includes('nirf')) {
    return 'NIRF';
  }

  if (combined.includes('mandatory') || combined.includes('disclosure')) {
    return 'MANDATORY_DISCLOSURE';
  }

  if (combined.includes('naac') || combined.includes('ssr') || combined.includes('iqac')) {
    return 'NAAC';
  }

  if (combined.includes('annual report') || combined.includes('aqar')) {
    return 'ANNUAL_REPORT';
  }

  if (combined.includes('fee') || combined.includes('admission')) {
    return 'ADMISSION';
  }

  return 'OTHER';
};

/**
 * Returns true when a URL points to a PDF document.
 */
export const isPdfUrl = (url: string): boolean => {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return pathname.endsWith('.pdf');
  } catch {
    return false;
  }
};
