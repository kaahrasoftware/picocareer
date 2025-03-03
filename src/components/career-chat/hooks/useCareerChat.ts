
import { useState, useRef, useCallback, useEffect } from 'react';
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
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(false);

  // Determine when to show the analyze button
  useEffect(() => {
    const userMessageCount = messages.filter(msg => msg.message_type === 'user').length;
    
    if (userMessageCount >= 12 && !isAnalyzing && !showAnalyzeButton) {
      setShowAnalyzeButton(true);
    }
    
    if (isAnalyzing || messages.some(msg => msg.message_type === 'recommendation')) {
      setShowAnalyzeButton(false);
    }
  }, [messages, isAnalyzing, showAnalyzeButton]);
  
  // Function to send message
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId || hasConfigError) return;
    await sendAIMessage(message);
    setInputMessage('');
  }, [sessionId, sendAIMessage, hasConfigError]);

  // Handle analyze button click
  const handleAnalyzeClick = async () => {
    if (!sessionId || hasConfigError) return;
    await analyzeResponses();
    setShowAnalyzeButton(false);
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
    showAnalyzeButton,
    setInputMessage,
    sendMessage,
    addMessage,
    handleAnalyzeClick
  };
}
