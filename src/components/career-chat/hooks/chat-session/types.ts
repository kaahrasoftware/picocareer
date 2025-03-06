
import { CareerChatMessage, CareerChatSession, ChatSessionMetadata } from "@/types/database/analytics";

export interface UseChatSessionReturn {
  messages: CareerChatMessage[];
  sessionId: string | null;
  isLoading: boolean;
  addMessage: (message: CareerChatMessage) => Promise<any>;
  pastSessions: CareerChatSession[];
  isFetchingPastSessions: boolean;
  fetchPastSessions: () => Promise<void>;
  endCurrentSession: () => Promise<void>;
  startNewSession: () => Promise<void>;
  resumeSession: (targetSessionId: string) => Promise<void>;
  deleteSession: (targetSessionId: string) => Promise<void>;
  updateSessionTitle: (targetSessionId: string, title: string) => Promise<void>;
  updateSessionMetadata: (metadata: Partial<ChatSessionMetadata>) => Promise<void>;
  sessionMetadata: ChatSessionMetadata | null;
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

export type MessageStatus = "queued" | "sending" | "sent" | "delivered" | "failed" | "seen";

export interface MessageDeliveryMetadata {
  attempts?: number;
  lastAttempt?: string;
  error?: string;
  receivedAt?: string;
  seenAt?: string;
}
