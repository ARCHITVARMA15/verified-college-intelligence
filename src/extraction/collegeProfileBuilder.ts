import type { ExtractedFacts } from './factExtractor.js';
import type { CollegeProfile, VerifiedFact } from './verification.js';

export interface BuildProfileInput {
  collegeName: string;
  sourceFiles: string[];
  facts: ExtractedFacts;
}

export const buildCollegeProfile = (input: BuildProfileInput): CollegeProfile => {
  const { collegeName, sourceFiles, facts } = input;

  return {
    college: collegeName,
    placements: {
      highestPackage: mapPackage(facts.highestPackage),
      medianPackage: mapPackage(facts.medianPackage),
      averagePackage: mapPackage(facts.averagePackage),
      placementPercentage: facts.placementPercentage,
      studentsPlaced: facts.studentsPlaced,
    },
    rankings: {
      nirf: facts.nirfRanking,
    },
    accreditation: facts.accreditation,
    recruiters: facts.recruiters ?? {
      value: [],
      confidence: 'LOW',
      reason: 'No recruiter list found in discovered documents',
      sourceUrl: '',
      sourceFile: '',
    },
    metadata: {
      sourceFiles,
      extractedAt: new Date().toISOString(),
    },
  };
};

const mapPackage = (
  candidate: ExtractedFacts['highestPackage'],
): VerifiedFact<{ value: number; unit: string }> | undefined => {
  if (!candidate) {
    return undefined;
  }

  return {
    value: {
      value: candidate.value.amount,
      unit: candidate.value.unit,
    },
    confidence: candidate.confidence,
    reason: candidate.reason,
    sourceUrl: candidate.sourceUrl,
    sourceFile: candidate.sourceFile,
  };
};
