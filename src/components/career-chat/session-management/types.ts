
import { CareerChatSession } from '@/types/database/analytics';

export type ChatSession = CareerChatSession;

export type MessageType = "system" | "user" | "bot" | "recommendation" | "session_end";

export type MessageStatus = "queued" | "sending" | "sent" | "delivered" | "failed" | "seen";

export interface MessageDeliveryMetadata {
  attempts?: number;
  lastAttempt?: string;
  error?: string;
  receivedAt?: string;
  seenAt?: string;
}

export interface QuestionCounts {
  education: number;
  skills: number;
  workstyle: number;
  goals: number;
  [key: string]: number;
}
