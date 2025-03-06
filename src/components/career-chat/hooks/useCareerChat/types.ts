
import { CareerChatMessage } from '@/types/database/analytics';
import { Dispatch, SetStateAction } from 'react';

export interface ChatSessionMetadata {
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
  updateSessionMetadata: (metadata: Partial<ChatSessionMetadata>) => Promise<void>;
  setCurrentCategory: Dispatch<SetStateAction<string | null>>;
  setQuestionProgress: Dispatch<SetStateAction<number>>;
  setIsSessionComplete: Dispatch<SetStateAction<boolean>>;
  endCurrentSession: () => Promise<void>;
}

export interface QuestionCounts {
  education: number;
  skills: number;
  workstyle: number;
  goals: number;
  [key: string]: number;
}
