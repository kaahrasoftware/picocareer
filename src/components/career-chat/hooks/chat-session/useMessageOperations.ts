
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';

export function useMessageOperations(sessionId: string | null, messages: CareerChatMessage[], setMessages: React.Dispatch<React.SetStateAction<CareerChatMessage[]>>) {
  
  const addMessage = async (message: CareerChatMessage) => {
    if (!sessionId) return null;
    
    try {
      // Optimistically add the message to the local state with a temp ID if it doesn't have one
      const tempId = message.id || `temp-${Date.now()}`;
      const messageWithTempId = { ...message, id: tempId };
      
      // Update local state with the message (either with its existing ID or a new temp ID)
      setMessages(prevMessages => {
        // Check if the message already exists in our state (by content and type)
        const existingMessageIndex = prevMessages.findIndex(
          m => m.content === message.content && m.message_type === message.message_type
        );
        
        if (existingMessageIndex >= 0) {
          // Message exists - just return current state
          return prevMessages;
        } else {
          // New message - add it
          return [...prevMessages, messageWithTempId];
        }
      });
      
      // Always save to database, regardless of ID format
      console.log('Saving message to database:', message.message_type, message.content.substring(0, 30) + '...');
      
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

      // Update the message in our local state with the one from the database (real ID)
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          (msg.id === tempId) ? data : msg
        )
      );
      
      console.log('Message saved successfully with ID:', data.id);
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  };

  return { addMessage };
}
