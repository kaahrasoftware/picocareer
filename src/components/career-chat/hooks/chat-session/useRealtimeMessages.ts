
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

    const channel = supabase
      .channel(`career-chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'career_chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          // Avoid duplicating messages that we've already added locally
          const exists = messages.some(msg => msg.id === payload.new.id);
          if (!exists) {
            console.log('Received new message via subscription:', payload.new.message_type);
            // Add the new message to our local state
            setMessages(currentMessages => [...currentMessages, payload.new as CareerChatMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, messages, setMessages]);
}
