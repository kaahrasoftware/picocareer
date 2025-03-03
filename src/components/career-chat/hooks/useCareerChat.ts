
import { useState, useRef, useCallback } from 'react';
import { useChatSession } from './useChatSession';
import { useCareerAnalysis } from './useCareerAnalysis';
import { useAIChat } from './useAIChat';
import { useQuestionTracking } from './useQuestionTracking';
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
  const { sendAIMessage, isTyping, hasConfigError } = useAIChat(sessionId, messages, addMessage);
  
  const { 
    currentCategory, 
    questionProgress, 
    questionCounts 
  } = useQuestionTracking(messages);
  
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to send message (simplified now that most logic is in useAIChat)
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId) return;
    await sendAIMessage(message);
    setInputMessage('');
  }, [sessionId, sendAIMessage]);

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
