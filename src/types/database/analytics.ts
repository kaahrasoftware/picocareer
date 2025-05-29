
// Define chat session related types
export interface CareerChatMessage {
  id: string;
  session_id: string;
  message_type: "system" | "user" | "bot" | "recommendation" | "session_end";
  content: string;
  metadata?: {
    hasOptions?: boolean;
    suggestions?: string[];
    category?: string;
    [key: string]: any;
  };
  delivery_metadata?: {
    tokens?: number;
    latency?: number;
    [key: string]: any;
  };
  message_index?: number;
  status?: string;
  created_at?: string;
}

export interface CareerChatSession {
  id: string;
  profile_id?: string;
  status?: string;
  created_at?: string;
  progress_data?: {
    education: number;
    skills: number;
    workstyle: number;
    goals: number;
    overall: number;
    [key: string]: number;
  };
  total_messages?: number;
  last_active_at?: string;
  session_metadata?: ChatSessionMetadata;
  updated_at?: string;
  is_suspended?: boolean;
  last_message_at?: string;
}

export interface ChatSessionMetadata {
  startedAt?: string;
  completedAt?: string;
  isComplete?: boolean;
  questionCounts?: {
    education: number;
    skills: number;
    workstyle: number;
    goals: number;
    [key: string]: number;
  };
  overallProgress?: number;
  categoryProgress?: {
    [category: string]: number;
  };
  [key: string]: any;
}
