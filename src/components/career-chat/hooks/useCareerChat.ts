
import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatSession } from './useChatSession';
import { useCareerAnalysis } from './useCareerAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CareerChatMessage } from '@/types/database/analytics';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track questions by category
  const [questionCounts, setQuestionCounts] = useState({
    education: 0,
    skills: 0,
    workstyle: 0,
    goals: 0
  });

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

    // Check latest bot message for category
    const botMessages = messages.filter(m => m.message_type === 'bot');
    if (botMessages.length === 0) return;
    
    const latestBotMessage = botMessages[botMessages.length - 1];
    
    // If we have a category in the metadata, update the current category
    if (latestBotMessage.metadata?.category) {
      const newCategory = latestBotMessage.metadata.category;
      setCurrentCategory(newCategory);
      
      // Update counts for this category
      setQuestionCounts(prev => ({
        ...prev,
        [newCategory]: prev[newCategory as keyof typeof prev] + 1
      }));
      
      // Calculate overall progress (assuming 12-15 questions total plan)
      const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0) + 1;
      setQuestionProgress(Math.min(Math.round((totalQuestions / 15) * 100), 100));
    }
    
    // If this is a recommendation message, set progress to 100%
    if (latestBotMessage.metadata?.isRecommendation) {
      setQuestionProgress(100);
      setCurrentCategory('complete');
    }
  }, [messages]);

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
      
      // Check if this is a recommendation (from structured response)
      const isRecommendation = response.data?.rawResponse?.type === 'recommendation' ||
                              response.data?.metadata?.isRecommendation;
      
      // Add bot response to messages locally
      if (response.data?.message) {
        const botMessage: CareerChatMessage = {
          id: response.data.messageId || `temp-${Date.now()}`,
          session_id: sessionId,
          message_type: isRecommendation ? 'recommendation' : 'bot',
          content: response.data.message,
          metadata: {
            ...(response.data.metadata || {}),
            rawResponse: response.data.rawResponse
          },
          created_at: new Date().toISOString()
        };
        
        // Manually add the bot message to messages
        await addMessage(botMessage);
        
        // Update progress when a recommendation is received
        if (isRecommendation) {
          setQuestionProgress(100);
          setCurrentCategory('complete');
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
  }, [sessionId, messages, addMessage]);

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
    addMessage
  };
}
