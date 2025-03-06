
import { useCallback } from 'react';
import { CareerChatMessage } from "@/types/database/analytics";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMessageSender(
  sessionId: string | null,
  messages: CareerChatMessage[],
  addMessage: (message: CareerChatMessage) => Promise<any>,
  setInputMessage: (message: string) => void,
  setIsTyping: (isTyping: boolean) => void,
  isSessionComplete: boolean,
  setQuestionProgress: (progress: number) => void,
  setCurrentCategory: (category: string | null) => void,
  setIsSessionComplete: (isComplete: boolean) => void
) {
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId || isSessionComplete) return;
    
    const userMessage: CareerChatMessage = {
      session_id: sessionId,
      message_type: 'user',
      content: message.trim(),
      metadata: {},
      created_at: new Date().toISOString()
    };

    await addMessage(userMessage);
    
    setInputMessage('');
    setIsTyping(true);
    
    try {
      const messageHistory = messages
        .filter(m => m.message_type === 'user' || m.message_type === 'bot')
        .slice(-10)
        .map(m => ({
          role: m.message_type === 'user' ? 'user' : 'assistant',
          content: m.content
        }));

      messageHistory.push({
        role: 'user',
        content: message.trim()
      });

      console.log('Sending message to AI service...');
      
      const response = await supabase.functions.invoke('career-chat-ai', {
        body: {
          message: message.trim(),
          sessionId,
          messages: messageHistory,
          instructions: {
            useStructuredFormat: true,
            specificQuestions: true,
            conciseOptions: true
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

      console.log('Got response from career-chat-ai');
      
      const isRecommendation = 
        response.data?.structuredMessage?.type === 'recommendation' ||
        response.data?.metadata?.isRecommendation;

      const isSessionEnd = 
        response.data?.structuredMessage?.type === 'session_end' ||
        response.data?.metadata?.isSessionEnd;
      
      if (response.data?.message) {
        const botMessage: CareerChatMessage = {
          session_id: sessionId,
          message_type: isSessionEnd ? 'system' : isRecommendation ? 'recommendation' : 'bot',
          content: response.data.message,
          metadata: {
            ...(response.data.metadata || {}),
            structuredMessage: response.data.structuredMessage,
            rawResponse: response.data.rawResponse,
            isSessionEnd: isSessionEnd
          },
          created_at: new Date().toISOString()
        };
        
        const savedMessage = await addMessage(botMessage);
        
        if (isRecommendation || isSessionEnd) {
          setQuestionProgress(100);
          setCurrentCategory('complete');
          
          if (isSessionEnd) {
            setIsSessionComplete(true);
          }
        }
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get a response. Please try again.');
      
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
  }, [sessionId, messages, addMessage, isSessionComplete, setInputMessage, setIsTyping, setQuestionProgress, setCurrentCategory, setIsSessionComplete]);

  return { sendMessage };
}
