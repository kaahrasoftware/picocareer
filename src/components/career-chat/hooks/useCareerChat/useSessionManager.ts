
import { useChatSession } from '../chat-session';
import { useCareerAnalysis } from '../useCareerAnalysis';
import { useEffect } from 'react';

export function useSessionManager() {
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

  return {
    messages,
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
    updateSessionTitle,
    analyzeResponses
  };
}
