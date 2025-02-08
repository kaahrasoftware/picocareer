
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

export interface DimensionScores {
  e_i_score: number;
  s_n_score: number;
  t_f_score: number;
  j_p_score: number;
  e_i_responses: number;
  s_n_responses: number;
  t_f_responses: number;
  j_p_responses: number;
  confidence_level: number;
}
