
export interface AssessmentQuestion {
  id: string;
  title: string;
  description?: string;
  type: 'multiple_choice' | 'multiple_select' | 'scale' | 'text';
  options?: string[];
  order: number;
  isRequired: boolean;
  isLast?: boolean;
}

export interface QuestionResponse {
  questionId: string;
  answer: string | string[] | number;
  timestamp: string;
}

export interface RelatedCareer {
  id: string;
  title: string;
  matchReason: string;
  similarityScore: number;
}

export interface CareerRecommendation {
  careerId: string;
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
  relatedCareers?: RelatedCareer[];
}

export interface AssessmentResult {
  id: string;
  userId: string;
  responses: QuestionResponse[];
  recommendations: CareerRecommendation[];
  completedAt: string;
  status: 'completed' | 'in_progress';
}

export interface AssessmentHistoryItem {
  id: string;
  completedAt: string;
  recommendationCount: number;
  topRecommendation: string;
  status: 'completed' | 'in_progress';
}
