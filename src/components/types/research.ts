export interface ResearchResponse {
  diagnosticSteps: Array<{
    step: string;
    details: string;
    tools?: string[];
    expectedReadings?: string;
    notes?: string;
  }>;
  possibleCauses: Array<{
    cause: string;
    likelihood: string;
    explanation: string;
  }>;
  recommendedFixes: Array<{
    fix: string;
    difficulty: string;
    estimatedCost: string;
    professionalOnly?: boolean;
    parts?: string[];
  }>;
  technicalNotes: {
    commonIssues: string[];
    serviceIntervals?: string[];
    recalls?: string[];
    tsbs?: string[];
  };
  references: Array<{
    source: string;
    url?: string;
    type: string;
    relevance: string;
  }>;
}

export interface DetailedResearchResponse {
  title: string;
  category: string;
  detailedDescription: string;
  additionalSteps?: string[];
  warnings?: string[];
  expertTips?: string[];
  relatedIssues?: string[];
  estimatedTime?: string;
  requiredExpertise?: string;
  additionalResources?: Array<{
    title: string;
    url?: string;
    description: string;
  }>;
  url?: string;
  fileType?: string;
  thumbnail?: string;
  sourceUrl?: string;
  link?: string;
} 