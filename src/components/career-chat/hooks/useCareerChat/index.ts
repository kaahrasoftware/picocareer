
import { useState, useRef, useCallback, useEffect } from 'react';
import { useMessageState } from './useMessageState';
import { useProgressTracker } from './useProgressTracker';
import { useSessionManager } from './useSessionManager';
import { useApiConfig } from './useApiConfig';
import { useEnhancedMessageSender } from './useEnhancedMessageSender';
import { CareerChatMessage } from '@/types/database/analytics';

export function useCareerChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    checkApiConfig, 
    hasConfigError 
  } = useApiConfig();

  const {
    messages,
    inputMessage,
    isLoading,
    isTyping, 
    setIsTyping,
    setInputMessage
  } = useMessageState();
  
  const {
    currentCategory,
    questionProgress,
    isSessionComplete,
    setCurrentCategory,
    setQuestionProgress,
    setIsSessionComplete
  } = useProgressTracker();

  const {
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    sessionId,
    sessionMetadata,
    updateSessionMetadata,
    addMessage,
    sendFirstQuestion
  } = useSessionManager(setIsSessionComplete, setCurrentCategory, setQuestionProgress);

  const {
    isAnalyzing,
    sendMessage,
    handleStartNewChat
  } = useEnhancedMessageSender({
    sessionId,
    messages,
    isSessionComplete,
    setInputMessage,
    setIsTyping,
    addMessage,
    updateSessionTitle,
    updateSessionMetadata,
    sessionMetadata,
    setIsSessionComplete,
    setCurrentCategory,
    setQuestionProgress,
    endCurrentSession
  });

  // Enhanced begin assessment handler
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

  // Check API configuration
  useEffect(() => {
    if (sessionId) {
      checkApiConfig(sessionId);
    }
  }, [sessionId, checkApiConfig]);

  return {
    // Message state
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    hasConfigError,
    
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
    handleBeginAssessment
  };
}
