
import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatSession } from './useChatSession';
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
  const [configErrorDetails, setConfigErrorDetails] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [questionProgress, setQuestionProgress] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track questions by category
  const [questionCounts, setQuestionCounts] = useState({
    education: 0,
    skills: 0,
    workstyle: 0,
    goals: 0,
    environment: 0
  });

  // Check API configuration on load
  useEffect(() => {
    const checkApiConfig = async () => {
      if (!sessionId) return;
      
      try {
        console.log('Checking DeepSeek API configuration...');
        
        const response = await supabase.functions.invoke('career-chat-ai', {
          body: { type: 'config-check' }
        });
        
        console.log('Config check response:', response);
        
        if (response.error || response.data?.error) {
          const errorMsg = response.error?.message || response.data?.error || 'Unknown error';
          console.error('DeepSeek API configuration issue:', errorMsg);
          setHasConfigError(true);
          setConfigErrorDetails(errorMsg);
          
          // Add error message for debug purposes
          addMessage({
            session_id: sessionId,
            message_type: 'system',
            content: `Debug Info: DeepSeek API configuration failed. Error: ${errorMsg}`,
            metadata: { error: true, debug: true },
            created_at: new Date().toISOString()
          });
        } else {
          console.log('DeepSeek API configured successfully');
          setHasConfigError(false);
          setConfigErrorDetails(null);
        }
      } catch (error) {
        console.error('Failed to check API configuration:', error);
        
        if (error instanceof Error) {
          setConfigErrorDetails(error.message);
          
          // Add error message for debug purposes
          addMessage({
            session_id: sessionId,
            message_type: 'system',
            content: `Debug Info: Failed to check DeepSeek API. Error: ${error.message}`,
            metadata: { error: true, debug: true },
            created_at: new Date().toISOString()
          });
        }
        
        // Don't set hasConfigError to true here for network errors, as they might be temporary
        // But show a toast to inform the user
        toast.error('Failed to connect to AI service. Please check your connection and try again.');
      }
    };
    
    checkApiConfig();
  }, [sessionId, addMessage]);

  // Update category and question counts based on messages
  useEffect(() => {
    if (messages.length === 0) return;

    // Check latest bot message for category and progress information
    const botMessages = messages.filter(m => 
      m.message_type === 'bot' || m.message_type === 'recommendation'
    );
    
    if (botMessages.length === 0) return;
    
    const latestBotMessage = botMessages[botMessages.length - 1];
    
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
      
      // Calculate overall progress (assuming up to 10 questions per category, 5 categories)
      const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0) + 1;
      setQuestionProgress(Math.min(Math.round((totalQuestions / 50) * 100), 100));
    }
    
    // If this is a recommendation message, set progress to 100%
    if (latestBotMessage.message_type === 'recommendation' || 
        latestBotMessage.metadata?.isRecommendation ||
        structuredMessage?.type === 'recommendation') {
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

      console.log(`Sending message to career-chat-ai with ${messageHistory.length} messages history`);
      
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

      console.log('AI response received:', response);

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
      const isRecommendation = 
        response.data?.structuredMessage?.type === 'recommendation' ||
        response.data?.rawResponse?.type === 'recommendation' ||
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
            structuredMessage: response.data.structuredMessage,
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
      
      let errorMessage = 'I\'m sorry, I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        errorMessage += `\n\nError details: ${error.message}`;
      }
      
      // Add error message
      await addMessage({
        session_id: sessionId,
        message_type: 'system',
        content: errorMessage,
        metadata: { error: true },
        created_at: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, messages, addMessage]);

  // Add retry function to attempt reconnection
  const retryConnection = useCallback(async () => {
    setHasConfigError(false);
    setConfigErrorDetails(null);
    
    try {
      const response = await supabase.functions.invoke('career-chat-ai', {
        body: { type: 'config-check' }
      });
      
      if (response.error || response.data?.error) {
        const errorMsg = response.error?.message || response.data?.error || 'Unknown error';
        console.error('DeepSeek API configuration still failing:', errorMsg);
        setHasConfigError(true);
        setConfigErrorDetails(errorMsg);
        toast.error('Still unable to connect to the AI service');
      } else {
        console.log('DeepSeek API reconnected successfully');
        setHasConfigError(false);
        setConfigErrorDetails(null);
        toast.success('Successfully connected to the AI service');
      }
    } catch (error) {
      console.error('Failed to reconnect to API:', error);
      setHasConfigError(true);
      
      if (error instanceof Error) {
        setConfigErrorDetails(error.message);
      }
      
      toast.error('Failed to reconnect to the AI service');
    }
  }, []);

  return {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    hasConfigError,
    configErrorDetails,
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
    retryConnection
  };
}
