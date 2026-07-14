import { describe, it, expect } from 'vitest';
import { extractTextFromHtml } from './htmlExtractor.js';
import { normalizeText } from './textNormalizer.js';

describe('extractTextFromHtml', () => {
  it('removes scripts and styles', () => {
    const html = '<html><head><style>body{}</style></head><body><script>alert("x")</script><p>Hello</p></body></html>';
    const text = normalizeText(extractTextFromHtml(html));

    expect(text).not.toContain('alert');
    expect(text).toContain('Hello');
  });

  it('preserves line breaks between paragraphs', () => {
    const html = '<p>First</p><p>Second</p>';
    const text = normalizeText(extractTextFromHtml(html));

    expect(text).toContain('First\nSecond');
  });

  it('strips tags while keeping readable text', () => {
    const html = '<div><h1>Title</h1><span>content</span></div>';
    const text = normalizeText(extractTextFromHtml(html));

    expect(text).toContain('Title');
    expect(text).toContain('content');
    expect(text).not.toContain('<h1>');
  });
});
