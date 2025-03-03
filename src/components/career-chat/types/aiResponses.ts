
// Structured types for AI responses

export type ResponseCategory = 'education' | 'skills' | 'workstyle' | 'goals';

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface QuestionResponse {
  type: 'question';
  content: {
    question: string;
    category: ResponseCategory;
    questionNumber: number;
    totalInCategory: number;
    options: QuestionOption[];
  };
  metadata?: Record<string, any>;
}

export interface AnswerResponse {
  type: 'answer';
  content: {
    selectedOption: string;
    questionNumber: number;
    category: ResponseCategory;
  };
  metadata?: Record<string, any>;
}

export interface CareerRecommendationItem {
  title: string;
  match: number;
  description: string;
}

export interface PersonalityInsightItem {
  type: string;
  match: number;
  traits: string[];
  description?: string;
}

export interface MentorRecommendationItem {
  name: string;
  expertise: string;
  experience: string;
  match: number;
}

export interface RecommendationResponse {
  type: 'recommendation';
  content: {
    careers: CareerRecommendationItem[];
    personalities: PersonalityInsightItem[];
    mentors: MentorRecommendationItem[];
    summary?: string;
  };
  metadata?: Record<string, any>;
}

export type AIResponse = QuestionResponse | AnswerResponse | RecommendationResponse;
