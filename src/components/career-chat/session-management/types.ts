
import { CareerChatSession } from '@/types/database/analytics';

export type ChatSession = CareerChatSession;

export type MessageType = "system" | "user" | "bot" | "recommendation" | "session_end";
