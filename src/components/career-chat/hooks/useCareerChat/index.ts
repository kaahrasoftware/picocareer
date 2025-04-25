
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
    updateSessionMetadata,
    addMessage
  } = useSessionManager(setIsSessionComplete, setCurrentCategory, setQuestionProgress);

  // Helper functions that need to be passed to the useMessageSender
  const getCurrentCategory = () => currentCategory || 'education';
  const getProgress = () => questionProgress || 0;
  
  // Mock implementation for these functions as examples - replace with actual implementations
  const analyzeResponses = async (messages: CareerChatMessage[]) => {
    console.log("Analyzing responses", messages);
    return Promise.resolve();
  };
  
  const advanceQuestion = () => {
    setQuestionProgress(prev => prev + 10);
  };
  
  const createQuestionMessage = (sessionId: string): CareerChatMessage => {
    return {
      id: `question-${Date.now()}`,
      session_id: sessionId,
      message_type: "bot",
      content: "What are your career goals?",
      metadata: {
        category: currentCategory
      }
    };
  };

  const {
    isAnalyzing,
    sendMessage,
    handleStartNewChat
  } = useMessageSender({
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
    endCurrentSession,
    getCurrentCategory,
    getProgress,
    isAnalyzing: false,
    analyzeResponses,
    advanceQuestion,
    createQuestionMessage
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
