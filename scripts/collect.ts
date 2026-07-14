import { readFileSync } from 'node:fs';
import { logger } from '../src/config/logger.js';
import { CollectionService, RobustHttpClient } from '../src/collection/index.js';
import type { CollegeInput } from '../src/collection/types/collegeInput.js';

const main = async (): Promise<void> => {
  const raw = readFileSync('data/colleges.json', 'utf-8');
  const colleges = JSON.parse(raw) as CollegeInput[];

  const httpClient = new RobustHttpClient({
    timeoutMs: 15_000,
    maxRetries: 3,
    requestDelayMs: 750,
  });

  const service = new CollectionService(httpClient, {
    outputRoot: 'data/colleges',
    maxDepth: 2,
    maxDocuments: 25,
    timeoutMs: 15_000,
    maxRetries: 3,
    requestDelayMs: 750,
  });

  logger.info({ collegeCount: colleges.length }, 'Starting document collection');

  const metadata = await service.collect(colleges);

  for (const college of metadata) {
    const downloaded = college.documents.filter((d) => d.downloaded).length;
    logger.info(
      { college: college.college, total: college.documents.length, downloaded },
      'College collection complete',
    );
  }
};

void main();
