
export interface AnalysisResponse {
  personalityTraits: string[];
  careerRecommendations: CareerRecommendation[];
  majorRecommendations: MajorRecommendation[];
  skillDevelopment: string[];
}

export interface CareerRecommendation {
  id: string;
  title: string;
  description: string;
  score: number;
  reasoning: string;
}

export interface MajorRecommendation {
  id: string;
  title: string;
  description: string;
  score: number;
  reasoning: string;
}

export interface TestResults {
  personality_traits: string;
  career_matches: string;
  major_matches: string;
  skill_development: string;
}

