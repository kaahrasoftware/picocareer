
import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatSession } from './chat-session'; // Updated import path
import { useCareerAnalysis } from './useCareerAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CareerChatMessage } from '@/types/database/analytics';
import { StructuredMessage } from '@/types/database/message-types';

// Client-side cache for template responses
const responseCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

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
  const [usingCachedResponse, setUsingCachedResponse] = useState(false);
  
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

  // Clean up expired cache entries periodically
  useEffect(() => {
    const clearExpiredCache = () => {
      const now = Date.now();
      Object.keys(responseCache).forEach(key => {
        if (now > responseCache[key].timestamp + CACHE_TTL) {
          delete responseCache[key];
        }
      });
    };
    
    const interval = setInterval(clearExpiredCache, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Generate cache key from message and context
  const generateCacheKey = useCallback((message: string, category?: string, questionNumber?: number) => {
    // For common starting messages, use a simpler key
    if (message.toLowerCase().includes('hi') && message.length < 10) {
      return 'greeting';
    }
    
    // For category-specific first questions
    if (category && questionNumber === 1) {
      return `${category}:1`;
    }
    
    // For other cases, use message hash
    return `msg:${hashString(message)}`;
  }, []);
  
  // Simple string hashing function
  const hashString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  };

  // Check if we can use a template for the first question in a category
  const getTemplateForCategory = useCallback((category: string, questionNumber: number): string | null => {
    if (questionNumber !== 1) return null;
    
    // Template responses for first question in each category
    const templates: Record<string, string> = {
      education: `Let's start by understanding your educational background. What's the highest level of education you've completed?`,
      skills: `Now let's focus on your skills and abilities. What technical skills are you most proficient in?`,
      workstyle: `Let's discuss your preferred work environment. Do you prefer working independently or as part of a team?`,
      goals: `Finally, let's talk about your career goals. Where do you see yourself in 5 years?`
    };
    
    return templates[category] || null;
  }, []);

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
    setUsingCachedResponse(false);
    
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

      // Get category and question info for potential template usage
      let latestCategory = currentCategory;
      let latestQuestionNumber = 1;
      
      // Find the last category and question number
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.metadata?.category && msg.metadata?.questionNumber) {
          latestCategory = msg.metadata.category;
          latestQuestionNumber = parseInt(msg.metadata.questionNumber) + 1;
          break;
        }
        
        // Also check structured message format
        const structuredMsg = msg.metadata?.structuredMessage as StructuredMessage | undefined;
        if (structuredMsg?.metadata?.progress) {
          latestCategory = structuredMsg.metadata.progress.category;
          latestQuestionNumber = parseInt(structuredMsg.metadata.progress.current) + 1;
          break;
        }
      }
      
      // Check client-side cache first
      const cacheKey = generateCacheKey(message, latestCategory as string, latestQuestionNumber);
      
      let response;
      const now = Date.now();
      
      if (responseCache[cacheKey] && now < responseCache[cacheKey].timestamp + CACHE_TTL) {
        console.log('Using cached response:', cacheKey);
        response = {
          data: responseCache[cacheKey].data
        };
        setUsingCachedResponse(true);
        
        // Add slight delay to make it feel more natural
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        console.log('Sending message to AI service...');
        
        // Check if we can use a template response for first question in category
        const templateResponse = latestCategory ? getTemplateForCategory(latestCategory as string, latestQuestionNumber) : null;
        
        if (templateResponse && latestQuestionNumber === 1) {
          // Simulate API response with template
          console.log('Using template response for first question in category:', latestCategory);
          
          // Create a structured message that looks like it came from the AI
          const structuredMsg = {
            type: "question",
            content: {
              intro: "Let's explore your " + latestCategory + " background.",
              question: templateResponse,
              options: [
                { id: "option1", text: "Option 1", category: latestCategory },
                { id: "option2", text: "Option 2", category: latestCategory },
                { id: "option3", text: "Option 3", category: latestCategory },
                { id: "option4", text: "Option 4", category: latestCategory }
              ]
            },
            metadata: {
              progress: {
                category: latestCategory,
                current: 1,
                total: 6,
                overall: getProgressPercentage(latestCategory as string, 1)
              },
              options: {
                type: "single",
                layout: "cards"
              }
            }
          };
          
          response = {
            data: {
              messageId: `template-${Date.now()}`,
              message: templateResponse,
              structuredMessage: structuredMsg,
              metadata: {
                category: latestCategory,
                questionNumber: 1,
                totalInCategory: 6,
                progress: getProgressPercentage(latestCategory as string, 1),
                hasOptions: true,
                suggestions: ["Option 1", "Option 2", "Option 3", "Option 4"],
                structuredMessage: structuredMsg
              }
            }
          };
          
          setUsingCachedResponse(true);
        } else {
          // Call our edge function
          response = await supabase.functions.invoke('career-chat-ai', {
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
        }
        
        // Cache the response if successful
        if (!response.error && response.data) {
          responseCache[cacheKey] = {
            data: response.data,
            timestamp: Date.now()
          };
          console.log('Cached response with key:', cacheKey);
        }
      }

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
            rawResponse: response.data.rawResponse
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
  }, [sessionId, messages, addMessage, isSessionComplete, currentCategory, generateCacheKey, getTemplateForCategory]);

  // Helper function to calculate progress percentage 
  const getProgressPercentage = (category: string, questionNumber: number): number => {
    const categoryIndex = ['education', 'skills', 'workstyle', 'goals'].indexOf(category);
    if (categoryIndex === -1) return 0;
    
    // Each category is 25% of progress, and each question is ~4% (1/24) of total progress
    const baseProgress = categoryIndex * 25; // Progress from completed categories
    const questionProgress = Math.floor((questionNumber / 6) * 25); // Progress within current category
    
    return Math.min(baseProgress + questionProgress, 100);
  };

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
    usingCachedResponse
  };
}
