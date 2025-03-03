
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';

export function useMessageManagement(sessionId: string | null) {
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);

  /**
   * Add a new message to the chat session
   */
  const addMessage = async (message: CareerChatMessage): Promise<any> => {
    if (!sessionId) return null;
    
    try {
      // Optimistically add the message to the local state
      setMessages(prevMessages => [...prevMessages, message]);
      
      // If the message already has an ID, it may be a message we're adding manually
      // after receiving from the API, so don't save it again
      if (message.id && !message.id.startsWith('temp-')) {
        return message;
      }
      
      // Otherwise save to the database
      const { data, error } = await supabase
        .from('career_chat_messages')
        .insert({
          session_id: message.session_id,
          message_type: message.message_type,
          content: message.content,
          metadata: message.metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing message:', error);
        throw error;
      }

      // Update the message in our local state with the one from the database
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          (message.id === msg.id) ? {
            id: data.id,
            session_id: data.session_id,
            message_type: data.message_type as "user" | "bot" | "system" | "recommendation",
            content: data.content,
            metadata: data.metadata,
            created_at: data.created_at
          } : msg
        )
      );

      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  };

  // Set up real-time updates for new messages
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
            // Add the new message to our local state
            const newMessage: CareerChatMessage = {
              id: payload.new.id as string,
              session_id: payload.new.session_id as string,
              message_type: payload.new.message_type as "user" | "bot" | "system" | "recommendation",
              content: payload.new.content as string,
              metadata: payload.new.metadata as Record<string, any>,
              created_at: payload.new.created_at as string
            };
            
            setMessages(currentMessages => [...currentMessages, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, messages]);

  return { messages, setMessages, addMessage };
}
