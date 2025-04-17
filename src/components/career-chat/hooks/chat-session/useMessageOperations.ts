
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';
import { v4 as uuidv4 } from 'uuid';
import { MessageDeliveryMetadata, MessageStatus } from './types';

export function useMessageOperations(
  sessionId: string | null, 
  messages: CareerChatMessage[], 
  setMessages: React.Dispatch<React.SetStateAction<CareerChatMessage[]>>
) {
  
  const addMessage = async (message: CareerChatMessage) => {
    if (!sessionId) return null;
    
    try {
      // Ensure the message has a proper UUID
      const messageId = message.id || uuidv4();
      
      // Calculate message index (for proper ordering)
      const messageIndex = messages.length;
      
      // Set initial message status
      const status: MessageStatus = 'sending';
      
      // Initialize delivery metadata
      const deliveryMetadata: MessageDeliveryMetadata = {
        attempts: 1,
        lastAttempt: new Date().toISOString()
      };
      
      // Create complete message with all fields
      const completeMessage: CareerChatMessage = { 
        ...message,
        id: messageId,
        session_id: sessionId,
        message_index: messageIndex,
        status,
        delivery_metadata: deliveryMetadata,
        created_at: message.created_at || new Date().toISOString()
      };
      
      // Optimistically add message to local state
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
          return [...prevMessages, completeMessage];
        }
      });
      
      // Save to database
      console.log('Saving message to database:', completeMessage.message_type, completeMessage.content.substring(0, 30) + '...');
      
      const { data, error } = await supabase
        .from('career_chat_messages')
        .insert({
          id: completeMessage.id,
          session_id: completeMessage.session_id,
          message_type: completeMessage.message_type,
          content: completeMessage.content,
          metadata: completeMessage.metadata,
          message_index: completeMessage.message_index,
          status: completeMessage.status,
          delivery_metadata: completeMessage.delivery_metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing message:', error);
        
        // Update local message status to failed
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            (msg.id === completeMessage.id) 
              ? { 
                  ...msg, 
                  status: 'failed',
                  delivery_metadata: {
                    ...msg.delivery_metadata as MessageDeliveryMetadata,
                    error: error.message,
                    lastAttempt: new Date().toISOString()
                  }
                } 
              : msg
          )
        );
        
        throw error;
      }

      // Update the message in our local state with the one from the database (real ID and updated status)
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          (msg.id === completeMessage.id) 
            ? { 
                ...(data as CareerChatMessage), 
                status: 'sent',
                delivery_metadata: {
                  ...(data?.delivery_metadata as MessageDeliveryMetadata || {}),
                  receivedAt: new Date().toISOString()
                }
              } 
            : msg
        )
      );
      
      console.log('Message saved successfully with ID:', data.id);
      
      // Update the total_messages counter in the session
      await supabase
        .from('career_chat_sessions')
        .update({ total_messages: messages.length + 1 }) 
        .eq('id', sessionId);
      
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  };

  // Function to retry failed messages
  const retryMessage = async (messageId: string) => {
    try {
      // Find the failed message in local state
      const failedMessage = messages.find(msg => msg.id === messageId && msg.status === 'failed');
      
      if (!failedMessage) {
        console.error('Failed message not found:', messageId);
        return null;
      }
      
      // Update delivery metadata
      const updatedDeliveryMetadata: MessageDeliveryMetadata = {
        ...(failedMessage.delivery_metadata as MessageDeliveryMetadata || {}),
        attempts: ((failedMessage.delivery_metadata as MessageDeliveryMetadata)?.attempts || 0) + 1,
        lastAttempt: new Date().toISOString(),
        error: undefined // Clear previous error
      };
      
      // Update local message status to sending
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                status: 'sending',
                delivery_metadata: updatedDeliveryMetadata
              } 
            : msg
        )
      );
      
      // Retry saving to database
      const { data, error } = await supabase
        .from('career_chat_messages')
        .upsert({
          id: failedMessage.id,
          session_id: failedMessage.session_id,
          message_type: failedMessage.message_type,
          content: failedMessage.content,
          metadata: failedMessage.metadata,
          message_index: failedMessage.message_index,
          status: 'sending',
          delivery_metadata: updatedDeliveryMetadata
        })
        .select()
        .single();

      if (error) {
        console.error('Error retrying message:', error);
        
        // Update local message status to failed again
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  status: 'failed',
                  delivery_metadata: {
                    ...(msg.delivery_metadata as MessageDeliveryMetadata || {}),
                    error: error.message,
                    lastAttempt: new Date().toISOString()
                  }
                } 
              : msg
          )
        );
        
        throw error;
      }

      // Update local state with success
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { 
                ...(data as CareerChatMessage), 
                status: 'sent',
                delivery_metadata: {
                  ...(data?.delivery_metadata as MessageDeliveryMetadata || {}),
                  receivedAt: new Date().toISOString()
                }
              } 
            : msg
        )
      );
      
      return data;
    } catch (error) {
      console.error('Error retrying message:', error);
      return null;
    }
  };

  return { addMessage, retryMessage };
}
