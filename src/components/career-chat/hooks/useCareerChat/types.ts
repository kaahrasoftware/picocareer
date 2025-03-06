
import { CareerChatMessage, ChatSessionMetadata } from '@/types/database/analytics';
import { Dispatch, SetStateAction } from 'react';
import { MessageType } from '@/components/career-chat/session-management/types';

export interface ChatSessionMetadataExtended extends ChatSessionMetadata {
  title?: string;
  isComplete?: boolean;
  overallProgress?: number;
  lastCategory?: string;
  completedAt?: string;
  [key: string]: any;
}

export interface MessageSenderProps {
  sessionId: string | null;
  sessionMetadata: ChatSessionMetadata | null;
  isSessionComplete: boolean;
  messages: CareerChatMessage[];
  setInputMessage: Dispatch<SetStateAction<string>>;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  updateSessionMetadata: (metadata: Partial<ChatSessionMetadataExtended>) => Promise<void>;
  setCurrentCategory: Dispatch<SetStateAction<string | null>>;
  setQuestionProgress: Dispatch<SetStateAction<number>>;
  setIsSessionComplete: Dispatch<SetStateAction<boolean>>;
  endCurrentSession: () => Promise<void>;
  addMessage: (message: CareerChatMessage) => Promise<any>;
  analyzeResponses: (messages: CareerChatMessage[]) => Promise<void>;
  startNewSession: () => Promise<void>;
}

export interface QuestionCounts {
  education: number;
  skills: number;
  workstyle: number;
  goals: number;
  [key: string]: number;
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
  pastSessions: any[];
  isFetchingPastSessions: boolean;
  fetchPastSessions: () => Promise<void>;
  endCurrentSession: () => Promise<void>;
  startNewSession: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  setInputMessage: Dispatch<SetStateAction<string>>;
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: CareerChatMessage) => Promise<any>;
  isSessionComplete: boolean;
  handleStartNewChat: () => Promise<void>;
  sessionId: string | null;
  sessionMetadata: ChatSessionMetadata | null;
}

export interface UseProgressTrackerReturn {
  currentCategory: string | null;
  questionProgress: number;
  isComplete: boolean;
  setCurrentCategory: Dispatch<SetStateAction<string | null>>;
  setQuestionProgress: Dispatch<SetStateAction<number>>;
  setIsComplete: Dispatch<SetStateAction<boolean>>;
  getCurrentCategory: () => string | null;
  getProgress: () => number;
}

export interface UseMessageStateReturn {
  messages: CareerChatMessage[];
  inputMessage: string;
  isTyping: boolean;
  isAnalyzing: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  setMessages: Dispatch<SetStateAction<CareerChatMessage[]>>;
  setInputMessage: Dispatch<SetStateAction<string>>;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
  setIsAnalyzing: Dispatch<SetStateAction<boolean>>;
}

export interface UseSessionManagerReturn {
  sessionId: string | null;
  isLoading: boolean;
  pastSessions: any[];
  isFetchingPastSessions: boolean;
  sessionMetadata: ChatSessionMetadata | null;
  isSessionComplete: boolean;
  setSessionId: Dispatch<SetStateAction<string | null>>;
  setIsSessionComplete: Dispatch<SetStateAction<boolean>>;
  fetchPastSessions: () => Promise<void>;
  endCurrentSession: () => Promise<void>;
  startNewSession: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  updateSessionMetadata: (metadata: Partial<ChatSessionMetadataExtended>) => Promise<void>;
}

export interface UseMessageSenderReturn {
  sendMessage: (message: string) => Promise<void>;
  handleStartNewChat: () => Promise<void>;
}

export interface UseApiConfigReturn {
  hasConfigError: boolean;
  configChecked: boolean;
  isConfigLoading: boolean;
}
