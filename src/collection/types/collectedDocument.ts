export interface CollectedDocument {
  title: string;
  type: string;
  url: string;
  localPath: string;
  extension: string;
  downloaded: boolean;
}

export interface CollegeCollectionMetadata {
  college: string;
  documents: CollectedDocument[];
}
