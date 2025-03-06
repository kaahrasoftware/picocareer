
import { CareerChatMessage } from "@/types/database/analytics";
import { StructuredMessage } from "@/types/database/message-types";

export interface UseCareerChatReturn {
  messages: CareerChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  isTyping: boolean;
  isAnalyzing: boolean;
  hasConfigError: boolean;
  currentCategory: string | null;
  questionProgress: number;
  pastSessions: any[];
  isFetchingPastSessions: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isSessionComplete: boolean;
  fetchPastSessions: () => Promise<void>;
  endCurrentSession: () => Promise<void>;
  startNewSession: () => Promise<void>;
  resumeSession: (targetSessionId: string) => Promise<void>;
  deleteSession: (targetSessionId: string) => Promise<void>;
  updateSessionTitle: (targetSessionId: string, title: string) => Promise<void>;
  setInputMessage: (message: string) => void;
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: CareerChatMessage) => Promise<any>;
}

export interface MessageCache {
  [key: string]: CareerChatMessage;
}

export interface QuestionCounts {
  education: number;
  skills: number;
  workstyle: number;
  goals: number;
}
