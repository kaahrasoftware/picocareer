export interface AssessmentQuestion {
  id: string;
  title: string;
  description?: string;
  type: 'multiple_choice' | 'multiple_select' | 'scale' | 'text';
  options?: string[];
  order: number;
  isRequired: boolean;
  isLast?: boolean;
  profileType?: string[];
  targetAudience?: string[];
  prerequisites?: any;
  conditionalLogic?: any;
  pathway_tier?: 'profile_detection' | 'career_choice' | 'subject_cluster' | 'refinement' | 'practical';
  related_pathway_ids?: string[];
  related_cluster_ids?: string[];
  visual_config?: {
    icon?: string;
    color?: string;
    layout?: 'cards' | 'buttons' | 'grid';
  };
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
  industry?: string;
  relatedCareers?: RelatedCareer[];
  pathway?: {
    id: string;
    title: string;
    color: string;
  };
  cluster?: {
    id: string;
    title: string;
  };
  pathwayJustification?: string;
  clusterAlignment?: string;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  responses: QuestionResponse[];
  recommendations: CareerRecommendation[];
  completedAt: string;
  status: 'completed' | 'in_progress';
  detectedProfileType?: 'middle_school' | 'high_school' | 'college' | 'career_professional';
  profileDetectionCompleted?: boolean;
  primaryPathways?: Array<{ id: string; title: string; score: number }>;
  subjectClusters?: Array<{ id: string; title: string; pathway_id: string; score: number }>;
}

export interface AssessmentHistoryItem {
  id: string;
  completedAt: string;
  recommendationCount: number;
  topRecommendation: string;
  status: 'completed' | 'in_progress';
}

export type ProfileType = 'middle_school' | 'high_school' | 'college' | 'career_professional';
