
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';

export function useRealtimeMessages(
  sessionId: string | null,
  messages: CareerChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<CareerChatMessage[]>>
) {
  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to new messages in the current session
    const subscription = supabase
      .channel(`career_chat_messages:session_id=eq.${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'career_chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as unknown as CareerChatMessage;
          
          // Check if message already exists
          const exists = messages.some(msg => msg.id === newMessage.id);
          if (!exists) {
            setMessages(currentMessages => [...currentMessages, newMessage]);
          }
        }
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sessionId, messages, setMessages]);
}
