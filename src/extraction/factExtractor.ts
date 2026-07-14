
export interface TextDocument {
  sourceUrl: string;
  sourceFile: string;
  extension: 'pdf' | 'html';
  text: string;
}

interface Candidate<T> {
  value: T;
  context: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  sourceUrl: string;
  sourceFile: string;
}

interface PackageCandidateValue {
  amount: number;
  unit: string;
}

interface ExtractedFacts {
  highestPackage?: Candidate<PackageCandidateValue>;
  medianPackage?: Candidate<PackageCandidateValue>;
  averagePackage?: Candidate<PackageCandidateValue>;
  placementPercentage?: Candidate<number>;
  studentsPlaced?: Candidate<number>;
  recruiters?: Candidate<string[]>;
  nirfRanking?: Candidate<{ year: number; rank: number }>;
  accreditation: {
    nba?: Candidate<boolean>;
    naac?: Candidate<string>;
    autonomous?: Candidate<boolean>;
    ugc?: Candidate<boolean>;
    aicte?: Candidate<boolean>;
  };
}

const YEARS = new Set([2023, 2024, 2025]);

export const extractFacts = (documents: TextDocument[]): ExtractedFacts => {
  const allCandidates: ExtractedFacts = {
    accreditation: {},
  };

  for (const doc of documents) {
    const highest = extractHighestPackage(doc);
    if (highest && (!allCandidates.highestPackage || isHigherConfidence(highest, allCandidates.highestPackage))) {
      allCandidates.highestPackage = highest;
    }

    const median = extractPackageWithContext(doc, ['median']);
    if (median && (!allCandidates.medianPackage || isHigherConfidence(median, allCandidates.medianPackage))) {
      allCandidates.medianPackage = median;
    }

    const average = extractPackageWithContext(doc, ['average', 'mean']);
    if (average && (!allCandidates.averagePackage || isHigherConfidence(average, allCandidates.averagePackage))) {
      allCandidates.averagePackage = average;
    }

    const placementPercentage = extractPlacementPercentage(doc);
    if (placementPercentage && (!allCandidates.placementPercentage || isHigherConfidence(placementPercentage, allCandidates.placementPercentage))) {
      allCandidates.placementPercentage = placementPercentage;
    }

    const studentsPlaced = extractStudentsPlaced(doc);
    if (studentsPlaced && (!allCandidates.studentsPlaced || isHigherConfidence(studentsPlaced, allCandidates.studentsPlaced))) {
      allCandidates.studentsPlaced = studentsPlaced;
    }

    const recruiters = extractRecruiters(doc);
    if (recruiters && (!allCandidates.recruiters || recruiters.value.length > allCandidates.recruiters.value.length)) {
      allCandidates.recruiters = recruiters;
    }

    const nirf = extractNirfRanking(doc);
    if (nirf && (!allCandidates.nirfRanking || isHigherConfidence(nirf, allCandidates.nirfRanking))) {
      allCandidates.nirfRanking = nirf;
    }

    const accreditation = extractAccreditation(doc);
    if (accreditation.nba) allCandidates.accreditation.nba = accreditation.nba;
    if (accreditation.naac) allCandidates.accreditation.naac = accreditation.naac;
    if (accreditation.autonomous) allCandidates.accreditation.autonomous = accreditation.autonomous;
    if (accreditation.ugc) allCandidates.accreditation.ugc = accreditation.ugc;
    if (accreditation.aicte) allCandidates.accreditation.aicte = accreditation.aicte;
  }

  return allCandidates;
};

const isHigherConfidence = <T>(left: Candidate<T>, right: Candidate<T>): boolean => {
  const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  return order[left.confidence] > order[right.confidence];
};

const baseConfidence = (doc: TextDocument): 'HIGH' | 'MEDIUM' | 'LOW' => {
  return doc.extension === 'pdf' ? 'HIGH' : 'MEDIUM';
};

const normalizeAmount = (amount: number, unit: string): PackageCandidateValue => {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit.includes('crore') || normalizedUnit === 'cr') {
    return { amount: amount * 100, unit: 'LPA' };
  }
  if (normalizedUnit.includes('lakh') || normalizedUnit === 'l' || normalizedUnit === 'lpa') {
    return { amount, unit: 'LPA' };
  }
  return { amount, unit: 'LPA' };
};

const parseAmount = (raw: string): number => {
  return Number.parseFloat(raw.replace(/,/g, ''));
};

const extractHighestPackage = (doc: TextDocument): Candidate<PackageCandidateValue> | undefined => {
  const explicitPattern = /(?:highest|top|maximum|max)(?:\s+\w+){0,10}?\s+(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d+)?)\s*(LPA|Lakhs?|Lakh|L|Cr(?:ore)?|Crore)/gi;
  const candidates: Candidate<PackageCandidateValue>[] = [];

  for (const match of doc.text.matchAll(explicitPattern)) {
    const amount = parseAmount(match[1]);
    const unit = match[2];
    candidates.push({
      value: normalizeAmount(amount, unit),
      context: match[0],
      confidence: doc.extension === 'pdf' ? 'HIGH' : 'MEDIUM',
      reason: `Matched explicit "highest package" amount "${match[0]}"`,
      sourceUrl: doc.sourceUrl,
      sourceFile: doc.sourceFile,
    });
  }

  if (candidates.length === 0) {
    return undefined;
  }

  return candidates.reduce((best, current) =>
    current.value.amount > best.value.amount ? current : best,
  );
};

const extractPackageWithContext = (
  doc: TextDocument,
  contextWords: string[],
): Candidate<PackageCandidateValue> | undefined => {
  const grouped = contextWords.join('|');
  const forwardPattern = new RegExp(
    `(?:${grouped})\\s*(?:package|CTC|salary)?(?:\\s+\\w+){0,10}?\\s+(?:₹|Rs\\.?|INR)?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(LPA|Lakhs?|Lakh|L|Cr(?:ore)?|Crore)`,
    'gi',
  );
  const reversePattern = new RegExp(
    `(?:₹|Rs\\.?|INR)?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(LPA|Lakhs?|Lakh|L|Cr(?:ore)?|Crore)(?:\\s+\\w+){0,10}?\\s*(?:${grouped})(?:\\s+package|\\s+CTC|\\s+salary)?`,
    'gi',
  );

  const candidates: Candidate<PackageCandidateValue>[] = [];
  for (const pattern of [forwardPattern, reversePattern]) {
    for (const match of doc.text.matchAll(pattern)) {
      candidates.push({
        value: normalizeAmount(parseAmount(match[1]), match[2]),
        context: match[0],
        confidence: doc.extension === 'pdf' ? 'HIGH' : 'MEDIUM',
        reason: `Matched ${contextWords.join('/')} package amount "${match[0]}"`,
        sourceUrl: doc.sourceUrl,
        sourceFile: doc.sourceFile,
      });
    }
  }

  if (candidates.length === 0) {
    return undefined;
  }

  return candidates.reduce((best, current) =>
    current.value.amount > best.value.amount ? current : best,
  );
};

const extractPlacementPercentage = (doc: TextDocument): Candidate<number> | undefined => {
  const patterns = [
    /(?:placement|placed).*?(?:rate|percentage|%).*?(\d+(?:\.\d+)?)\s*%/gi,
    /(\d+(?:\.\d+)?)\s*%.*?(?:placement|placed)/gi,
    /(?:placement|placed).*?(\d+(?:\.\d+)?)\s*%/gi,
  ];

  const candidates: Candidate<number>[] = [];

  for (const pattern of patterns) {
    for (const match of doc.text.matchAll(pattern)) {
      const value = Number.parseFloat(match[1]);
      if (value > 0 && value <= 100) {
        candidates.push({
          value,
          context: match[0],
          confidence: baseConfidence(doc),
          reason: `Matched placement percentage "${match[0]}"`,
          sourceUrl: doc.sourceUrl,
          sourceFile: doc.sourceFile,
        });
      }
    }
  }

  if (candidates.length === 0) {
    return undefined;
  }

  return candidates.reduce((best, current) =>
    current.confidence === best.confidence
      ? current.value > best.value
        ? current
        : best
      : isHigherConfidence(current, best)
        ? current
        : best,
  );
};

const extractStudentsPlaced = (doc: TextDocument): Candidate<number> | undefined => {
  const patterns = [
    /(\d+(?:,\d{3})*)\s*(?:students?|candidates?)\s+(?:were\s+)?placed/gi,
    /students?\s+placed\s*:?\s*(\d+(?:,\d{3})*)/gi,
    /(?:total\s+)?(?:students?|candidates?)\s+placed\s*:?\s*(\d+(?:,\d{3})*)/gi,
  ];

  const candidates: Candidate<number>[] = [];

  for (const pattern of patterns) {
    for (const match of doc.text.matchAll(pattern)) {
      const value = Number.parseInt(match[1].replace(/,/g, ''), 10);
      if (value > 0) {
        candidates.push({
          value,
          context: match[0],
          confidence: baseConfidence(doc),
          reason: `Matched students placed count "${match[0]}"`,
          sourceUrl: doc.sourceUrl,
          sourceFile: doc.sourceFile,
        });
      }
    }
  }

  return candidates.sort((a, b) => b.value - a.value)[0];
};

const RECRUITER_HEADINGS = /(?:our\s+|top\s+|major\s+|leading\s+|key\s+|recruiting\s+)?recruiters?(?:\s+\w+){0,3}?\s*[\n:]/i;

const extractRecruiters = (doc: TextDocument): Candidate<string[]> | undefined => {
  const match = RECRUITER_HEADINGS.exec(doc.text);
  if (!match) {
    return undefined;
  }

  const start = match.index + match[0].length;
  const section = doc.text.slice(start, start + 3000);

  const delimiterPattern = /[,\n\r·•|/]/;
  const rawItems = section
    .replace(/\n+/g, '\n')
    .split(delimiterPattern)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && item.length < 60 && !/^\d+$/.test(item));

  const unique = Array.from(new Set(rawItems));
  const companies = unique.slice(0, 50);

  if (companies.length === 0) {
    return undefined;
  }

  return {
    value: companies,
    context: section.slice(0, 200),
    confidence: baseConfidence(doc),
    reason: `Parsed recruiter list from section following "${match[0].trim()}"`,
    sourceUrl: doc.sourceUrl,
    sourceFile: doc.sourceFile,
  };
};

const extractNirfRanking = (doc: TextDocument): Candidate<{ year: number; rank: number }> | undefined => {
  const yearFirstPattern = /nirf\s+(?:rank(?:ing)?)?\s*(?:for\s+)?(\b202[3-5]\b).*?(\d{1,4})/gi;
  const rankFirstPattern = /nirf\s+(?:rank(?:ing)?)?\s*(?:for\s+)?(\d{1,4}).*?(\b202[3-5]\b)/gi;
  const standalonePattern = /nirf\s+(?:rank(?:ing)?)?\s*:?\s*(\d{1,4})/gi;

  const candidates: Candidate<{ year: number; rank: number }>[] = [];

  for (const match of doc.text.matchAll(yearFirstPattern)) {
    const year = Number.parseInt(match[1], 10);
    const rank = Number.parseInt(match[2], 10);
    if (rank > 0 && rank <= 1000 && YEARS.has(year)) {
      candidates.push({
        value: { year, rank },
        context: match[0],
        confidence: baseConfidence(doc),
        reason: `Matched NIRF rank "${match[0]}"`,
        sourceUrl: doc.sourceUrl,
        sourceFile: doc.sourceFile,
      });
    }
  }

  for (const match of doc.text.matchAll(rankFirstPattern)) {
    const rank = Number.parseInt(match[1], 10);
    const year = Number.parseInt(match[2], 10);
    if (rank > 0 && rank <= 1000 && YEARS.has(year)) {
      candidates.push({
        value: { year, rank },
        context: match[0],
        confidence: baseConfidence(doc),
        reason: `Matched NIRF rank "${match[0]}"`,
        sourceUrl: doc.sourceUrl,
        sourceFile: doc.sourceFile,
      });
    }
  }

  for (const match of doc.text.matchAll(standalonePattern)) {
    const rank = Number.parseInt(match[1], 10);
    if (rank > 0 && rank <= 1000) {
      const context = doc.text.slice(Math.max(0, match.index - 30), match.index + 30);
      const year = extractYear(context);
      candidates.push({
        value: { year: year ?? 2024, rank },
        context: match[0],
        confidence: baseConfidence(doc),
        reason: `Matched NIRF rank "${match[0]}"`,
        sourceUrl: doc.sourceUrl,
        sourceFile: doc.sourceFile,
      });
    }
  }

  return candidates.sort((a, b) => b.value.year - a.value.year)[0];
};

const extractYear = (text: string): number | undefined => {
  const pattern = /\b(202[3-5])\b/g;
  let latest: number | undefined;

  for (const match of text.matchAll(pattern)) {
    const year = Number.parseInt(match[1], 10);
    if (YEARS.has(year)) {
      if (latest === undefined || year > latest) {
        latest = year;
      }
    }
  }

  return latest;
};

interface AccreditationCandidates {
  nba?: Candidate<boolean>;
  naac?: Candidate<string>;
  autonomous?: Candidate<boolean>;
  ugc?: Candidate<boolean>;
  aicte?: Candidate<boolean>;
}

const extractAccreditation = (doc: TextDocument): AccreditationCandidates => {
  const result: AccreditationCandidates = {};
  const text = doc.text;

  if (/\bNBA\b/.test(text)) {
    result.nba = {
      value: true,
      context: 'NBA',
      confidence: baseConfidence(doc),
      reason: 'Matched NBA accreditation mention',
      sourceUrl: doc.sourceUrl,
      sourceFile: doc.sourceFile,
    };
  }

  const naacMatch = /\bNAAC\b.*?([A-C][+]?(?:\+)?)(?:\s*grade)?/gi.exec(text);
  if (/\bNAAC\b/.test(text)) {
    const grade = naacMatch?.[1] ?? 'Accredited';
    result.naac = {
      value: grade.trim(),
      context: 'NAAC',
      confidence: baseConfidence(doc),
      reason: 'Matched NAAC accreditation mention',
      sourceUrl: doc.sourceUrl,
      sourceFile: doc.sourceFile,
    };
  }

  if (/\bautonomous\b/i.test(text)) {
    result.autonomous = {
      value: true,
      context: 'autonomous',
      confidence: baseConfidence(doc),
      reason: 'Matched autonomous status mention',
      sourceUrl: doc.sourceUrl,
      sourceFile: doc.sourceFile,
    };
  }

  if (/\bUGC\b/.test(text)) {
    result.ugc = {
      value: true,
      context: 'UGC',
      confidence: baseConfidence(doc),
      reason: 'Matched UGC mention',
      sourceUrl: doc.sourceUrl,
      sourceFile: doc.sourceFile,
    };
  }

  if (/\bAICTE\b/.test(text)) {
    result.aicte = {
      value: true,
      context: 'AICTE',
      confidence: baseConfidence(doc),
      reason: 'Matched AICTE mention',
      sourceUrl: doc.sourceUrl,
      sourceFile: doc.sourceFile,
    };
  }

  return result;
};

export type { ExtractedFacts, Candidate, PackageCandidateValue };
