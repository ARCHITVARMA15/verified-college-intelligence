import * as cheerio from 'cheerio';

/**
 * Extracts readable text from HTML while preserving structural line breaks.
 * Scripts, styles and navigation elements are removed first.
 */
export const extractTextFromHtml = (html: string): string => {
  const $ = cheerio.load(html);

  $('script, style, nav, footer, header, aside, noscript, iframe').remove();

  let text = $('body').html() ?? '';
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/\s*(p|div|tr|td|th|li|h[1-6])>/gi, '\n');
  text = text.replace(/<[^>]+>/g, ' ');

  return text;
};
