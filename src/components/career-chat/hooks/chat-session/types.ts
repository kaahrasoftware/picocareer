
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
