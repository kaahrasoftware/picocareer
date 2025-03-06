
import { CareerChatMessage, CareerChatSession, ChatSessionMetadata } from "@/types/database/analytics";
import { MessageType, MessageStatus, MessageDeliveryMetadata, QuestionCounts } from "@/components/career-chat/session-management/types";

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

// Export the types from the centralized location for convenience
export type { MessageType, MessageStatus, MessageDeliveryMetadata, QuestionCounts };
