import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import axios from 'axios';
import { logger } from '../src/config/logger.js';
import { OfficialWebsiteDiscoveryStrategy } from '../src/discovery/strategies/officialWebsiteDiscoveryStrategy.js';
import { CollegeRegistryService } from '../src/registry/services/collegeRegistryService.js';
import { collegeSeedData } from '../src/registry/seed/collegeSeedData.js';

const OUTPUT_PATH = 'output/djsce-discovery.json';

const main = async (): Promise<void> => {
  const registry = new CollegeRegistryService();
  for (const college of collegeSeedData) {
    registry.register(college);
  }

  const djsce = registry.findById('djsce-mumbai');
  if (!djsce) {
    throw new Error('DJSCE not found in college registry seed data');
  }

  const strategy = new OfficialWebsiteDiscoveryStrategy(axios);
  const candidates = await strategy.discover(djsce);

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(candidates, null, 2));

  logger.info(
    { college: djsce.officialName, candidateCount: candidates.length, outputPath: OUTPUT_PATH },
    'Discovery complete',
  );
};

void main();
