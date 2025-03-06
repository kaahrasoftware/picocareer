
import { useState, useEffect } from 'react';
import { useMessageState } from './useMessageState';
import { useSessionManager } from './useSessionManager';
import { useProgressTracker } from './useProgressTracker';
import { useApiConfig } from './useApiConfig';
import { useMessageSender } from './useMessageSender';
import { UseCareerChatReturn } from './types';

export function useCareerChat(): UseCareerChatReturn {
  const {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isTyping,
    setIsTyping,
    localIsTyping,
    setLocalIsTyping,
    hasConfigError,
    setHasConfigError,
    currentCategory,
    setCurrentCategory,
    questionProgress,
    setQuestionProgress,
    messagesEndRef,
    questionCounts,
    setQuestionCounts,
    isSessionComplete,
    setIsSessionComplete
  } = useMessageState();

  const {
    sessionId,
    isLoading,
    isAnalyzing,
    addMessage,
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle
  } = useSessionManager();

  const [configChecked, setConfigChecked] = useState(false);

  // Track progress of chat
  useProgressTracker(
    messages,
    setCurrentCategory,
    setQuestionProgress,
    questionCounts,
    setIsSessionComplete
  );

  // Check API configuration
  useApiConfig(
    sessionId, 
    setHasConfigError, 
    isLoading, 
    messages.length, 
    configChecked, 
    setConfigChecked
  );

  // Handle session end state
  useEffect(() => {
    const hasSessionEndMessage = messages.some(msg => 
      msg.message_type === 'session_end' || 
      msg.metadata?.isSessionEnd === true
    );
    
    if (hasSessionEndMessage) {
      setIsSessionComplete(true);
    } else {
      setIsSessionComplete(false);
    }
  }, [messages, setIsSessionComplete]);

  // Update local typing state when isTyping changes
  useEffect(() => {
    setLocalIsTyping(isTyping);
  }, [isTyping, setLocalIsTyping]);

  // Message sending functionality
  const { sendMessage } = useMessageSender(
    sessionId,
    messages,
    addMessage,
    setInputMessage,
    setIsTyping,
    isSessionComplete,
    setQuestionProgress,
    setCurrentCategory,
    setIsSessionComplete
  );

  return {
    messages,
    inputMessage,
    isLoading,
    isTyping: localIsTyping, // Use local state for immediate feedback
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
