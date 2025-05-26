
export interface CareerChatMessage {
  id: string;
  session_id: string;
  message_type: "user" | "system" | "bot" | "recommendation" | "session_end";
  content: string;
  metadata?: any;
  created_at: string;
}

export interface ChatSessionMetadata {
  progressData?: { [category: string]: number };
  lastActiveAt?: string;
  isCompleted?: boolean;
}

export interface CareerChatSession {
  id: string;
  profile_id: string;
  session_name?: string;
  progress_data?: { [category: string]: number };
  last_active_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: ChatSessionMetadata;
}
