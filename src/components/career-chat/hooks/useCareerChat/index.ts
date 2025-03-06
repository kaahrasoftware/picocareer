
import { useState, useRef } from 'react';
import { useMessageState } from './useMessageState';
import { useMessageSender } from './useMessageSender';
import { useProgressTracker } from './useProgressTracker';
import { useSessionManager } from './useSessionManager';
import { useApiConfig } from './useApiConfig';
import { CareerChatMessage } from '@/types/database/analytics';

export function useCareerChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Split the hook into several smaller, focused hooks
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
    updateSessionMetadata
  } = useSessionManager(setIsSessionComplete, setCurrentCategory, setQuestionProgress);

  const {
    isAnalyzing,
    sendMessage,
    addMessage,
    handleStartNewChat
  } = useMessageSender({
    sessionId,
    sessionMetadata,
    isSessionComplete,
    messages,
    setInputMessage,
    setIsTyping,
    updateSessionTitle,
    updateSessionMetadata,
    setCurrentCategory,
    setQuestionProgress,
    setIsSessionComplete,
    endCurrentSession
  });

  // Check API configuration
  checkApiConfig(sessionId);

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
    handleStartNewChat
  };
}
