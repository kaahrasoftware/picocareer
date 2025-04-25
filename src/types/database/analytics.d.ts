
export interface CareerChatMessage {
  id: string;
  session_id?: string;
  message_type: "system" | "user" | "bot" | "recommendation" | "session_end";
  content: string;
  metadata?: {
    [key: string]: any;
    category?: string;
    progress?: {
      category?: string;
      step?: number;
      total?: number;
    };
    hasOptions?: boolean;
    suggestions?: string[];
    structuredMessage?: any;
    isSessionEnd?: boolean;
    rawResponse?: any;
    career?: string;
    score?: number;
  };
  message_index?: number;
  status?: string;
  delivery_metadata?: any;
  created_at?: string;
}

export interface ChatSessionMetadata {
  title?: string;
  startedAt?: string;
  completedAt?: string;
  overallProgress?: number;
  currentQuestionIndex?: number;
  lastCategory?: string;
  isComplete?: boolean;
  questionCounts?: {
    education: number;
    skills: number;
    workstyle: number;
    goals: number;
    [key: string]: number;
  };
  [key: string]: any;
}

export interface CareerChatSession {
  id: string;
  profile_id?: string;
  status?: string;
  created_at?: string;
  session_metadata?: ChatSessionMetadata;
  progress_data: {
    [key: string]: number;
    education: number;
    skills: number;
    workstyle: number;
    goals: number;
    overall: number;
  };
  total_messages?: number;
  last_active_at?: string;
  is_suspended?: boolean;
}

export interface CareerAnalysisResult {
  summary: string;
  personality_traits: string[];
  skills: {
    technical: string[];
    soft: string[];
    [key: string]: string[];
  };
  interests: string[];
  work_preferences: {
    environment: string;
    teamwork: string;
    pace: string;
    [key: string]: string;
  };
  education_level: string;
  careers: Array<{
    title: string;
    score: number;
    reasoning: string;
  }>;
}
