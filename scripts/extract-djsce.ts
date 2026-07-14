import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { logger } from '../src/config/logger.js';
import {
  buildCollegeProfile,
  extractFacts,
  extractTextFromHtml,
  extractTextFromPdf,
  loadDocuments,
  loadMetadata,
  normalizeText,
} from '../src/extraction/index.js';
import type { TextDocument } from '../src/extraction/index.js';

const OUTPUT_PATH = 'output/djsce-profile.json';
const METADATA_PATH = 'data/colleges/djsce-mumbai/metadata.json';

const main = async (): Promise<void> => {
  const metadata = loadMetadata(METADATA_PATH);
  const loadedDocuments = loadDocuments(METADATA_PATH);

  const textDocuments: TextDocument[] = [];

  for (const doc of loadedDocuments) {
    try {
      const rawText =
        doc.extension === 'pdf'
          ? await extractTextFromPdf(doc.content)
          : extractTextFromHtml(doc.content.toString('utf-8'));
      textDocuments.push({
        sourceUrl: doc.sourceUrl,
        sourceFile: doc.sourceFile,
        extension: doc.extension,
        text: normalizeText(rawText),
      });
    } catch (error) {
      logger.warn(
        { sourceFile: doc.sourceFile, error: error instanceof Error ? error.message : String(error) },
        'Failed to extract text from document',
      );
    }
  }

  const facts = await extractFacts(textDocuments);
  const profile = buildCollegeProfile({
    collegeName: metadata.college,
    sourceFiles: loadedDocuments.map((d) => d.sourceFile),
    facts,
  });

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(profile, null, 2));

  logger.info(
    { college: metadata.college, sourceFiles: profile.metadata.sourceFiles.length, outputPath: OUTPUT_PATH },
    'Extraction complete',
  );
};

void main();
