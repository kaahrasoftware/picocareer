
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
  detectedProfileType?: 'middle_school' | 'high_school' | 'college' | 'career_professional';
  profileDetectionCompleted?: boolean;
}

export interface AssessmentHistoryItem {
  id: string;
  completedAt: string;
  recommendationCount: number;
  topRecommendation: string;
  status: 'completed' | 'in_progress';
}

export type ProfileType = 'middle_school' | 'high_school' | 'college' | 'career_professional';

// Database type for raw assessment question from Supabase
export interface DatabaseAssessmentQuestion {
  id: string;
  title: string;
  description: string | null;
  type: 'multiple_choice' | 'multiple_select' | 'scale' | 'text';
  options: any;
  order_index: number;
  is_required: boolean;
  is_active: boolean;
  profile_type?: string[] | null;
  target_audience?: string[] | null;
  prerequisites?: any;
  conditional_logic?: any;
  created_at: string;
  updated_at: string;
}

// Database type for career assessment with new profile detection fields
export interface DatabaseCareerAssessment {
  id: string;
  user_id: string;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  detected_profile_type?: 'middle_school' | 'high_school' | 'college' | 'career_professional';
  profile_detection_completed?: boolean;
}
