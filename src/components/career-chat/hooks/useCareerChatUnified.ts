
import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CareerChatMessage } from '@/types/database/analytics';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { callCareerChatAI } from '../services/aiChatService';
import { toast } from 'sonner';
import { useChatSession } from './chat-session';

export function useCareerChatUnified() {
  const { session } = useAuthSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use the existing chat session hook for session management
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
    updateSessionTitle,
    updateSessionMetadata,
    sessionMetadata,
    sendFirstQuestion
  } = useChatSession();
  
  // Local state for UI
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>('education');
  const [questionProgress, setQuestionProgress] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId || isTyping) return;

    setIsTyping(true);
    
    // Add user message
    const userMessage: CareerChatMessage = {
      id: uuidv4(),
      session_id: sessionId,
      message_type: 'user',
      content: message.trim(),
      metadata: {},
      created_at: new Date().toISOString()
    };

    await addMessage(userMessage);
    setInputMessage('');

    try {
      // Call AI service (preserving existing API integration)
      const aiResponse = await callCareerChatAI({
        sessionId,
        messages: [...messages, userMessage],
        userMessage: message.trim(),
        currentCategory: currentCategory || 'education',
        questionCount: Math.floor(questionProgress / 25) + 1
      });

      // Process AI response
      const aiMessage: CareerChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        message_type: aiResponse.type === 'session_end' ? 'session_end' : 'bot',
        content: aiResponse.content.question || aiResponse.content.message || 'Thank you for sharing!',
        metadata: {
          structuredMessage: aiResponse,
          category: currentCategory,
          suggestions: aiResponse.content.suggestions || []
        },
        created_at: new Date().toISOString()
      };

      await addMessage(aiMessage);

      // Update progress
      if (aiResponse.type === 'session_end') {
        setIsSessionComplete(true);
        setQuestionProgress(100);
      } else {
        setQuestionProgress(prev => Math.min(prev + 10, 90));
      }

    } catch (error) {
      console.error('Error processing AI response:', error);
      
      const errorMessage: CareerChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        message_type: 'system',
        content: "I'm sorry, I encountered an error. Could you please try again?",
        metadata: { error: true },
        created_at: new Date().toISOString()
      };
      
      await addMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, messages, currentCategory, questionProgress, isTyping, addMessage]);

  const handleSuggestionClick = (suggestion: string) => {
    if (isTyping) return;
    sendMessage(suggestion);
  };

  const handleStartNewChat = async () => {
    setIsSessionComplete(false);
    setQuestionProgress(0);
    setCurrentCategory('education');
    await startNewSession();
  };

  const handleDownloadResults = () => {
    toast.info('Download feature coming soon!');
  };

  const handleBeginAssessment = useCallback(async () => {
    if (!sessionId || isTyping) return;
    
    try {
      setIsTyping(true);
      await sendFirstQuestion(sessionId);
    } catch (error) {
      console.error('Error beginning assessment:', error);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, isTyping, sendFirstQuestion, setIsTyping]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return {
    // Message state
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    
    // Progress tracking
    currentCategory,
    questionProgress,
    isSessionComplete,
    
    // Session management
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    sessionMetadata,
    
    // UI refs
    messagesEndRef,
    
    // Actions
    setInputMessage,
    sendMessage,
    addMessage,
    handleStartNewChat,
    handleSuggestionClick,
    handleDownloadResults,
    handleBeginAssessment
  };
}
