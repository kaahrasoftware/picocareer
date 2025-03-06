
import { CareerChatMessage } from "@/types/database/analytics";

export interface UseChatSessionReturn {
  messages: CareerChatMessage[];
  sessionId: string | null;
  isLoading: boolean;
  addMessage: (message: CareerChatMessage) => Promise<any>;
  pastSessions: any[];
  isFetchingPastSessions: boolean;
  fetchPastSessions: () => Promise<void>;
  endCurrentSession: () => Promise<void>;
  startNewSession: () => Promise<void>;
  resumeSession: (targetSessionId: string) => Promise<void>;
  deleteSession: (targetSessionId: string) => Promise<void>;
  updateSessionTitle: (targetSessionId: string, title: string) => Promise<void>;
}

// Define MessageType to include session_end
export type MessageType = "system" | "user" | "bot" | "recommendation" | "session_end";

// Add interface for question counts with index signature
export interface QuestionCounts {
  education: number;
  skills: number;
  workstyle: number;
  goals: number;
  [key: string]: number; // Index signature to allow string keys
}
