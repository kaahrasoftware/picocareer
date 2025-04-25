
import { Dispatch, SetStateAction } from 'react';
import { CareerChatMessage, ChatSessionMetadata } from '@/types/database/analytics';

export interface MessageSenderProps {
  sessionId: string;
  messages: CareerChatMessage[];
  isSessionComplete: boolean;
  setInputMessage: Dispatch<SetStateAction<string>>;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
  addMessage: (message: CareerChatMessage) => Promise<any>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  updateSessionMetadata: (metadata: Partial<ChatSessionMetadata>) => Promise<void>;
  sessionMetadata: ChatSessionMetadata | null;
  setIsSessionComplete: Dispatch<SetStateAction<boolean>>;
  setCurrentCategory: Dispatch<SetStateAction<string | null>>;
  setQuestionProgress: Dispatch<SetStateAction<number>>;
  endCurrentSession: () => Promise<void>;
  getCurrentCategory: () => string;
  getProgress: () => number;
  isAnalyzing: boolean;
  analyzeResponses: (messages: CareerChatMessage[]) => Promise<void>;
  advanceQuestion: () => void;
  createQuestionMessage: (sessionId: string) => CareerChatMessage;
}

export interface UseMessageSenderReturn {
  sendMessage: (message: string) => Promise<void>;
  handleStartNewChat: () => Promise<void>;
  isAnalyzing: boolean;
}

export interface QuestionCounts {
  education: number;
  skills: number;
  workstyle: number;
  goals: number;
  [key: string]: number;
}

export type MessageType = 'user' | 'system' | 'bot' | 'recommendation' | 'session_end';
export type MessageStatus = 'sending' | 'sent' | 'failed' | 'seen';

export interface MessageDeliveryMetadata {
  attempts: number;
  lastAttempt: string;
  receivedAt?: string;
  error?: string;
}
