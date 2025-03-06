
export interface ChatSession {
  id: string;
  created_at: string;
  title?: string;
  status: string;
  message_count: number;
}

export type MessageType = "system" | "user" | "bot" | "recommendation" | "session_end";
