
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'career_chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          // Update the message in our local state
          console.log('Message updated via subscription:', payload.new.id);
          setMessages(currentMessages => 
            currentMessages.map(msg => 
              msg.id === payload.new.id ? payload.new as CareerChatMessage : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status: ${status}`);
      });

    // Session updates subscription
    const sessionChannel = supabase
      .channel(`session-updates-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'career_chat_sessions',
          filter: `id=eq.${sessionId}`
        },
        async (payload) => {
          console.log('Session updated via subscription:', payload.new.id);
          // We don't directly update the session here - that's handled by the parent hook
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(sessionChannel);
    };
  }, [sessionId, messages, setMessages]);
}
