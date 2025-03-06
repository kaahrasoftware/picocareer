
import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatSession } from './chat-session'; 
import { useCareerAnalysis } from './useCareerAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CareerChatMessage } from '@/types/database/analytics';
import { StructuredMessage } from '@/types/database/message-types';
import { QuestionCounts } from './chat-session/types';

export function useCareerChat() {
  const { 
    messages, 
    sessionId, 
    isLoading, 
    addMessage, 
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle 
  } = useChatSession();
  
  const { isAnalyzing, analyzeResponses } = useCareerAnalysis(sessionId || '', addMessage);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [questionProgress, setQuestionProgress] = useState(0);
  const [messageCache, setMessageCache] = useState<Map<string, CareerChatMessage>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [questionCounts, setQuestionCounts] = useState<QuestionCounts>({
    education: 0,
    skills: 0,
    workstyle: 0,
    goals: 0
  });
  
  const [isSessionComplete, setIsSessionComplete] = useState(false);

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
      }
    };
    
    checkApiConfig();
  }, [sessionId]);

  useEffect(() => {
    if (messages.length === 0) return;

    const hasSessionEndMessage = messages.some(msg => 
      msg.message_type === 'session_end' || 
      msg.metadata?.isSessionEnd === true
    );
    
    if (hasSessionEndMessage) {
      setIsSessionComplete(true);
      setCurrentCategory('complete');
      setQuestionProgress(100);
      return;
    }

    const hasRecommendationMessage = messages.some(msg => 
      msg.message_type === 'recommendation' || 
      msg.metadata?.isRecommendation === true
    );
    
    if (hasRecommendationMessage) {
      setQuestionProgress(100);
      setCurrentCategory('complete');
      return;
    }

    const botMessages = messages.filter(m => m.message_type === 'bot');
    if (botMessages.length === 0) return;
    
    const latestBotMessage = botMessages[botMessages.length - 1];
    
    const structuredMessage = latestBotMessage.metadata?.structuredMessage as StructuredMessage | undefined;
    
    if (structuredMessage?.type === 'question' && structuredMessage.metadata.progress) {
      const category = structuredMessage.metadata.progress.category?.toLowerCase() || 'general';
      const overall = structuredMessage.metadata.progress.overall;
      
      setCurrentCategory(category);
      
      if (typeof overall === 'number') {
        setQuestionProgress(overall);
      } else if (typeof overall === 'string') {
        if (overall.includes('%')) {
          setQuestionProgress(parseInt(overall.replace('%', '')));
        } else {
          setQuestionProgress(parseInt(overall));
        }
      } else {
        const current = structuredMessage.metadata.progress.current || 1;
        const total = 24;
        setQuestionProgress(Math.min(Math.round((current / total) * 100), 100));
      }
    } 
    else if (latestBotMessage.metadata?.category) {
      const category = (latestBotMessage.metadata.category as string).toLowerCase();
      setCurrentCategory(category);
      
      const totalAnswered = Object.values(questionCounts).reduce((a, b) => a + b, 0) + 1;
      setQuestionProgress(Math.min(Math.round((totalAnswered / 24) * 100), 100));
    }
  }, [messages, questionCounts]);

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
          message_type: isSessionEnd ? 'session_end' : isRecommendation ? 'recommendation' : 'bot',
          content: response.data.message,
          metadata: {
            ...(response.data.metadata || {}),
            structuredMessage: response.data.structuredMessage,
            rawResponse: response.data.rawResponse
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
  }, [sessionId, messages, addMessage, isSessionComplete]);

  return {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    hasConfigError,
    currentCategory,
    questionProgress,
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    messagesEndRef,
    setInputMessage,
    sendMessage,
    addMessage,
    isSessionComplete
  };
}
