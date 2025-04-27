
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';

export function useMessageOperations(
  sessionId: string | null,
  messages: CareerChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<CareerChatMessage[]>>
) {

  const addMessage = async (message: CareerChatMessage): Promise<CareerChatMessage | null> => {
    if (!sessionId) return null;
    
    try {
      // Set the session ID and message index
      message.session_id = sessionId;
      message.message_index = messages.length;
      
      // Save message to database
      const { data, error } = await supabase
        .from('career_chat_messages')
        .insert(message)
        .select()
        .single();
      
      if (error) {
        console.error("Error adding message:", error);
        return null;
      }
      
      // Add to local state (converted to the right type)
      const savedMessage = data as unknown as CareerChatMessage;
      setMessages(currentMessages => [...currentMessages, savedMessage]);
      
      return savedMessage;
    } catch (error) {
      console.error("Error in addMessage:", error);
      return null;
    }
  };

  return { addMessage };
}
