export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface VerifiedFact<T> {
  value: T;
  confidence: Confidence;
  reason: string;
  sourceUrl: string;
  sourceFile: string;
}

export interface PackageValue {
  value: number;
  unit: string;
}

export interface NirfRanking {
  year: number;
  rank: number;
}

export interface CollegeProfile {
  college: string;
  placements: {
    highestPackage?: VerifiedFact<PackageValue>;
    medianPackage?: VerifiedFact<PackageValue>;
    averagePackage?: VerifiedFact<PackageValue>;
    placementPercentage?: VerifiedFact<number>;
    studentsPlaced?: VerifiedFact<number>;
  };
  rankings: {
    nirf?: VerifiedFact<NirfRanking>;
  };
  accreditation: {
    nba?: VerifiedFact<boolean>;
    naac?: VerifiedFact<string>;
    autonomous?: VerifiedFact<boolean>;
    ugc?: VerifiedFact<boolean>;
    aicte?: VerifiedFact<boolean>;
  };
  recruiters: VerifiedFact<string[]>;
  metadata: {
    sourceFiles: string[];
    extractedAt: string;
  };
}
