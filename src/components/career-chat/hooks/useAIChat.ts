
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CareerChatMessage } from '@/types/database/analytics';
import { formatAIResponse, formatUserMessage } from '../utils/responseFormatter';

export function useAIChat(
  sessionId: string | null, 
  messages: CareerChatMessage[], 
  addMessage: (message: CareerChatMessage) => Promise<any>
) {
  const [isTyping, setIsTyping] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);
  
  // Check API configuration on load
  const checkApiConfig = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await supabase.functions.invoke('career-chat-ai', {
        body: { type: 'config-check' }
      });
      
      if (response.error || response.data?.error) {
        console.warn('DeepSeek API configuration issue:', response.error || response.data?.error);
        setHasConfigError(true);
      } else {
        setHasConfigError(false);
      }
    } catch (error) {
      console.error('Failed to check API configuration:', error);
      // Don't set hasConfigError to true here, as it might be a temporary network issue
    }
  }, [sessionId]);

  // Function to send message and get AI response
  const sendAIMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId) return;
    
    // Add user message using our formatter
    const userMessage = formatUserMessage(message.trim(), sessionId);
    await addMessage(userMessage);
    
    setIsTyping(true);
    
    try {
      // Format messages for the AI
      const messageHistory = messages
        .filter(m => m.message_type === 'user' || m.message_type === 'bot')
        .map(m => ({
          role: m.message_type === 'user' ? 'user' : 'assistant',
          content: m.content,
          // Include metadata for assistant messages to help the AI understand context
          ...(m.message_type === 'bot' && m.metadata ? { metadata: m.metadata } : {})
        }));

      // Add the new user message
      messageHistory.push({
        role: 'user',
        content: message.trim()
      });

      // Call our edge function
      const response = await supabase.functions.invoke('career-chat-ai', {
        body: {
          message: message.trim(),
          sessionId,
          messages: messageHistory,
          instructions: {
            structuredFormat: true,
            responseType: 'json'
          }
        }
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to get AI response');
      }

      if (response.data?.error) {
        console.error('AI service error:', response.data.error);
        throw new Error(response.data.error);
      }

      // Log successful response for debugging
      console.log('Got response from career-chat-ai:', response.data);
      
      // Process bot response using our formatter
      if (response.data?.message) {
        const botMessage = formatAIResponse(
          response.data.message, 
          sessionId
        );
        
        // Add messageId if provided
        if (response.data.messageId) {
          botMessage.id = response.data.messageId;
        }
        
        // Manually add the bot message to messages
        await addMessage(botMessage);
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get a response. Please try again.');
      
      // Add error message
      await addMessage({
        session_id: sessionId,
        message_type: 'system',
        content: "I'm sorry, I encountered an error. Please try again.",
        metadata: { error: true },
        created_at: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, messages, addMessage]);

  return {
    sendAIMessage,
    isTyping,
    hasConfigError,
    checkApiConfig
  };
}
