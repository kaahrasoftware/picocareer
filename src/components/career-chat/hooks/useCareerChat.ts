
import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatSession } from './chat-session'; // Updated import path
import { useCareerAnalysis } from './useCareerAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CareerChatMessage } from '@/types/database/analytics';
import { StructuredMessage } from '@/types/database/message-types';

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
  const [lastResponseFromCache, setLastResponseFromCache] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track questions by category
  const [questionCounts, setQuestionCounts] = useState({
    education: 0,
    skills: 0,
    workstyle: 0,
    goals: 0
  });
  
  // Track if a session is completed/ended
  const [isSessionComplete, setIsSessionComplete] = useState(false);

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

  // Update category and question counts based on messages
  useEffect(() => {
    if (messages.length === 0) return;

    // Check for session end messages first
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

    // Check for recommendation messages next
    const hasRecommendationMessage = messages.some(msg => 
      msg.message_type === 'recommendation' || 
      msg.metadata?.isRecommendation === true
    );
    
    if (hasRecommendationMessage) {
      setQuestionProgress(100);
      setCurrentCategory('complete');
      return;
    }

    // Check latest bot message for category and progress information
    const botMessages = messages.filter(m => 
      m.message_type === 'bot'
    );
    
    if (botMessages.length === 0) return;
    
    const latestBotMessage = botMessages[botMessages.length - 1];
    
    // Check if response was from cache
    if (latestBotMessage.metadata?.fromCache || latestBotMessage.metadata?.fromTemplate) {
      setLastResponseFromCache(true);
    } else {
      setLastResponseFromCache(false);
    }
    
    // First check for structured message format (new)
    const structuredMessage = latestBotMessage.metadata?.structuredMessage as StructuredMessage | undefined;
    
    if (structuredMessage?.type === 'question' && structuredMessage.metadata.progress) {
      // Using new structured format
      const category = structuredMessage.metadata.progress.category;
      const overall = structuredMessage.metadata.progress.overall;
      
      setCurrentCategory(category);
      setQuestionProgress(overall);
      
      // Update counts for this category
      setQuestionCounts(prev => ({
        ...prev,
        [category]: prev[category as keyof typeof prev] + 1
      }));
    } 
    // Fallback to legacy format
    else if (latestBotMessage.metadata?.category) {
      const newCategory = latestBotMessage.metadata.category;
      setCurrentCategory(newCategory);
      
      // Update counts for this category
      setQuestionCounts(prev => ({
        ...prev,
        [newCategory]: prev[newCategory as keyof typeof prev] + 1
      }));
      
      // Calculate overall progress (assuming 24 questions total - 6 per category)
      const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0) + 1;
      setQuestionProgress(Math.min(Math.round((totalQuestions / 24) * 100), 100));
    }
  }, [messages]);

  // Function to send message and get AI response
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId || isSessionComplete) return;
    
    // Add user message
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
      // Format messages for the AI - only sending the most relevant messages to improve performance
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

      console.log('Sending message to AI service...');
      
      // Call our edge function
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

      // Log successful response for debugging
      console.log('Got response from career-chat-ai:', response.data);
      
      // Check if response came from cache
      if (response.data?.fromCache || response.data?.fromTemplate) {
        console.log('Response retrieved from cache or template');
        setLastResponseFromCache(true);
      } else {
        setLastResponseFromCache(false);
      }
      
      // Check if this is a recommendation or session end
      const isRecommendation = 
        response.data?.structuredMessage?.type === 'recommendation' ||
        response.data?.rawResponse?.type === 'recommendation' ||
        response.data?.metadata?.isRecommendation;

      const isSessionEnd = 
        response.data?.structuredMessage?.type === 'session_end' ||
        response.data?.rawResponse?.type === 'session_end' ||
        response.data?.metadata?.isSessionEnd;
      
      // Add bot response to messages locally
      if (response.data?.message) {
        console.log('Creating bot message to save to DB');
        
        const botMessage: CareerChatMessage = {
          session_id: sessionId,
          message_type: isSessionEnd ? 'session_end' : isRecommendation ? 'recommendation' : 'bot',
          content: response.data.message,
          metadata: {
            ...(response.data.metadata || {}),
            structuredMessage: response.data.structuredMessage,
            rawResponse: response.data.rawResponse,
            fromCache: response.data.fromCache || false,
            fromTemplate: response.data.fromTemplate || false
          },
          created_at: new Date().toISOString()
        };
        
        // Add the bot message to database and state
        const savedMessage = await addMessage(botMessage);
        console.log('Bot message saved:', savedMessage ? 'success' : 'failed');
        
        // Update progress when a recommendation or session end is received
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
    isSessionComplete,
    lastResponseFromCache
  };
}
