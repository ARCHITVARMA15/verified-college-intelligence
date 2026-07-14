import { describe, it, expect, vi } from 'vitest';
import { extractTextFromPdf } from './pdfExtractor.js';

vi.mock('pdf-parse', () => ({
  PDFParse: vi.fn().mockImplementation(() => ({
    getText: vi.fn().mockResolvedValue({ text: 'Extracted PDF text' }),
    destroy: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('extractTextFromPdf', () => {
  it('returns extracted text from a PDF buffer', async () => {
    const buffer = new Uint8Array([1, 2, 3]);
    const text = await extractTextFromPdf(buffer);

    expect(text).toBe('Extracted PDF text');
  });
});
