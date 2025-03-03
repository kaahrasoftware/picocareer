
import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatSession } from './useChatSession';
import { useCareerAnalysis } from './useCareerAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CareerChatMessage } from '@/types/database/analytics';

export function useCareerChat() {
  const { messages, sessionId, isLoading, addMessage } = useChatSession();
  const { isAnalyzing, analyzeResponses } = useCareerAnalysis(sessionId || '', addMessage);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check API configuration on load
  useEffect(() => {
    const checkApiConfig = async () => {
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
    };
    
    checkApiConfig();
  }, [sessionId]);

  // Function to send message and get AI response
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId) return;
    
    // Add user message
    await addMessage({
      session_id: sessionId,
      message_type: 'user',
      content: message.trim(),
      metadata: {},
      created_at: new Date().toISOString()
    });
    
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Format messages for the DeepSeek API
      const messageHistory = messages
        .filter(m => m.message_type === 'user' || m.message_type === 'bot')
        .map(m => ({
          role: m.message_type === 'user' ? 'user' : 'assistant',
          content: m.content
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
          messages: messageHistory
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
      
      // Add bot response to messages locally
      if (response.data?.message) {
        const botMessage: CareerChatMessage = {
          id: response.data.messageId || `temp-${Date.now()}`,
          session_id: sessionId,
          message_type: 'bot',
          content: response.data.message,
          metadata: response.data.metadata || {},
          created_at: new Date().toISOString()
        };
        
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
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    hasConfigError,
    messagesEndRef,
    setInputMessage,
    sendMessage
  };
}
