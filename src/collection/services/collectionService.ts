import { writeFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { CollegeInput } from '../types/collegeInput.js';
import type { CollegeCollectionMetadata, CollectedDocument } from '../types/collectedDocument.js';
import { CollegeCrawler } from '../discovery/collegeCrawler.js';
import { Downloader, buildLocalFilename } from '../download/downloader.js';
import type { HttpClient } from '../http/httpClient.js';
import { classifyDocument, isPdfUrl } from '../utils/documentClassifier.js';

interface CollectionServiceOptions {
  outputRoot: string;
  maxDepth: number;
  maxDocuments: number;
  timeoutMs: number;
  maxRetries: number;
  requestDelayMs: number;
}

const DEFAULT_OPTIONS: CollectionServiceOptions = {
  outputRoot: 'data/colleges',
  maxDepth: 2,
  maxDocuments: 25,
  timeoutMs: 15_000,
  maxRetries: 3,
  requestDelayMs: 500,
};

export class CollectionService {
  private readonly httpClient: HttpClient;
  private readonly options: CollectionServiceOptions;

  constructor(httpClient: HttpClient, options: Partial<CollectionServiceOptions> = {}) {
    this.httpClient = httpClient;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async collect(colleges: CollegeInput[]): Promise<CollegeCollectionMetadata[]> {
    const metadata: CollegeCollectionMetadata[] = [];

    for (const college of colleges) {
      const collegeMetadata = await this.collectCollege(college);
      metadata.push(collegeMetadata);
    }

    return metadata;
  }

  private async collectCollege(college: CollegeInput): Promise<CollegeCollectionMetadata> {
    const documentsDir = `${this.options.outputRoot}/${college.id}/documents`;
    mkdirSync(documentsDir, { recursive: true });

    const crawler = new CollegeCrawler(this.httpClient, {
      maxDepth: this.options.maxDepth,
      maxDocuments: this.options.maxDocuments,
      timeoutMs: this.options.timeoutMs,
      maxRetries: this.options.maxRetries,
      requestDelayMs: this.options.requestDelayMs,
    });

    const downloader = new Downloader(this.httpClient);

    const links = await crawler.crawl(college);
    const documents: CollectedDocument[] = [];
    const usedNames = new Set<string>();

    for (const link of links) {
      const documentType = classifyDocument(link.title, link.url);
      const filename = buildLocalFilename(link.url, documentType, usedNames);
      const localPath = `${documentsDir}/${filename}`;
      const relativePath = `data/colleges/${college.id}/documents/${filename}`;
      const result = await downloader.download(link.url, localPath);

      documents.push({
        title: link.title,
        type: documentType,
        url: link.url,
        localPath: relativePath,
        extension: isPdfUrl(link.url) ? 'pdf' : 'html',
        downloaded: result.success,
      });
    }

    const metadata: CollegeCollectionMetadata = {
      college: college.name,
      documents,
    };

    const metadataPath = `${this.options.outputRoot}/${college.id}/metadata.json`;
    mkdirSync(dirname(metadataPath), { recursive: true });
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return metadata;
  }
}
