export interface PDFExportData {
  assessmentId: string;
  completedAt: string;
  detectedProfileType?: string | null;
  recommendations: Array<{
    title: string;
    description: string;
    matchScore: number;
    reasoning: string;
    salaryRange?: string;
    growthOutlook?: string;
    timeToEntry?: string;
    requiredSkills?: string[];
    educationRequirements?: string[];
    workEnvironment?: string;
  }>;
  responses: Array<{
    questionId: string;
    answer: string | string[] | number;
    timestamp: string;
  }>;
}

export interface PDFGenerationOptions {
  includeResponses?: boolean;
  includeFullDetails?: boolean;
  companyBranding?: {
    name: string;
    website: string;
    logoUrl?: string;
  };
}