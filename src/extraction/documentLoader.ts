import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

export interface LoadedDocument {
  sourceUrl: string;
  sourceFile: string;
  extension: 'pdf' | 'html';
  content: Uint8Array;
}

export interface CollegeDocumentMetadata {
  title: string;
  type: string;
  url: string;
  localPath: string;
  extension: string;
  downloaded: boolean;
}

export interface CollegeMetadata {
  college: string;
  documents: CollegeDocumentMetadata[];
}

export const loadMetadata = (metadataPath: string): CollegeMetadata => {
  const raw = readFileSync(metadataPath, 'utf-8');
  return JSON.parse(raw) as CollegeMetadata;
};

export const loadDocuments = (metadataPath: string): LoadedDocument[] => {
  const metadata = loadMetadata(metadataPath);
  const loaded: LoadedDocument[] = [];

  for (const doc of metadata.documents) {
    if (!doc.downloaded) {
      continue;
    }

    const extension = extname(doc.localPath).toLowerCase().slice(1);
    if (extension !== 'pdf' && extension !== 'html') {
      continue;
    }

    loaded.push({
      sourceUrl: doc.url,
      sourceFile: doc.localPath,
      extension,
      content: readFileSync(doc.localPath),
    });
  }

  return loaded;
};
