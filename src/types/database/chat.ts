
import { Database } from "@/integrations/supabase/types";

export type ChatRoom = Database["public"]["Tables"]["hub_chat_rooms"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["hub_chat_messages"]["Row"];
export type ChatParticipant = Database["public"]["Tables"]["hub_chat_participants"]["Row"];
export type ChatReaction = Database["public"]["Tables"]["hub_chat_reactions"]["Row"];

export interface ChatMessageWithSender extends ChatMessage {
  sender: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  reactions?: ChatReaction[];
}
