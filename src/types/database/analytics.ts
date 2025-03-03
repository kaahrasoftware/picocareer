
// Define types for the career chat feature

export interface CareerChatSession {
  id: string;
  profile_id: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  last_message_at: string;
}

export interface CareerChatMessage {
  id?: string;
  session_id: string;
  message_type: 'user' | 'bot' | 'system' | 'recommendation';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CareerRecommendation {
  id?: string;
  session_id: string;
  profile_id: string;
  career_id?: string;
  career_title: string;
  match_score: number;
  reasoning: string;
  created_at: string;
}

export interface CareerAnalysisResult {
  summary: string;
  personality_traits: string[];
  skills: {
    technical: string[];
    soft: string[];
  };
  interests: string[];
  work_preferences: {
    environment: string;
    teamwork: string;
    pace: string;
  };
  education_level: string;
  careers: Array<{
    title: string;
    score: number;
    reasoning: string;
  }>;
}
