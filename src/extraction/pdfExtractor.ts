import { PDFParse } from 'pdf-parse';

/**
 * Extracts plain text from a PDF buffer using pdf-parse.
 */
export const extractTextFromPdf = async (buffer: Uint8Array): Promise<string> => {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
};
