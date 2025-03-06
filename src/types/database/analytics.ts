/**
 * Defines structured message types for the career chat
 */

export interface CareerChatMessage {
  id: string;
  session_id: string;
  message_type: "system" | "user" | "bot" | "recommendation" | "session_end";
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}
