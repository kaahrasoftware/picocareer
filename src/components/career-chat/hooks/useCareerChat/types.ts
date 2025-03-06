
import { CareerChatMessage, CareerChatSession, ChatSessionMetadata } from "@/types/database/analytics";
import { StructuredMessage } from "@/types/database/message-types";

export interface ChatSessionMetadataExtended extends ChatSessionMetadata {
  isComplete?: boolean;
  lastCategory?: string;
  overallProgress?: number;
  completedAt?: string;
  title?: string;
}

export interface UseCareerChatReturn {
  messages: CareerChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  isTyping: boolean;
  isAnalyzing: boolean;
  hasConfigError: boolean;
  currentCategory: string | null;
  questionProgress: number;
  pastSessions: CareerChatSession[];
  isFetchingPastSessions: boolean;
  fetchPastSessions: () => Promise<void>;
  endCurrentSession: () => Promise<void>;
  startNewSession: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  setInputMessage: (message: string) => void;
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: CareerChatMessage) => Promise<any>;
  isSessionComplete: boolean;
  handleStartNewChat: () => Promise<void>;
}

export interface UseProgressTrackerReturn {
  currentCategory: string | null;
  questionProgress: number;
  isSessionComplete: boolean;
  setCurrentCategory: (category: string | null) => void;
  setQuestionProgress: (progress: number) => void;
  setIsSessionComplete: (complete: boolean) => void;
}

export interface UseMessageStateReturn {
  messages: CareerChatMessage[];
  inputMessage: string;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  setMessages: React.Dispatch<React.SetStateAction<CareerChatMessage[]>>;
  setInputMessage: (message: string) => void;
  setIsTyping: (isTyping: boolean) => void;
}

export interface UseSessionManagerReturn {
  sessionId: string | null;
  sessionMetadata: ChatSessionMetadataExtended | null; 
  isLoading: boolean;
  pastSessions: CareerChatSession[];
  isFetchingPastSessions: boolean;
  fetchPastSessions: () => Promise<void>;
  endCurrentSession: () => Promise<void>;
  startNewSession: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  updateSessionMetadata: (metadata: Partial<ChatSessionMetadata>) => Promise<void>;
}

export interface MessageSenderProps {
  sessionId: string | null;
  messages: CareerChatMessage[];
  isSessionComplete: boolean;
  currentCategory: string | null;
  getProgress: () => number;
  isAnalyzing: boolean;
  analyzeResponses: (messages: CareerChatMessage[]) => Promise<void>;
  addMessage: (message: CareerChatMessage) => Promise<any>;
  setIsTyping: (isTyping: boolean) => void;
  setInputMessage: (message: string) => void;
  setIsSessionComplete: (complete: boolean) => void;
  setCurrentCategory: (category: string | null) => void;
  setQuestionProgress: (progress: number) => void;
  updateSessionMetadata: (metadata: Partial<ChatSessionMetadata>) => Promise<void>;
  sessionMetadata: ChatSessionMetadataExtended | null;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  advanceQuestion: () => void;
  getCurrentCategory: () => string | null;
  createQuestionMessage: (sessionId: string) => CareerChatMessage;
  endCurrentSession: () => Promise<void>;
}

export interface UseMessageSenderReturn {
  sendMessage: (message: string) => Promise<void>;
  handleStartNewChat: () => Promise<void>;
}

export interface UseApiConfigReturn {
  isAnalyzing: boolean;
  hasConfigError: boolean;
  analyzeResponses: (messages: CareerChatMessage[]) => Promise<void>;
}
