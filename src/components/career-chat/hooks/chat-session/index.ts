
import { useState, useEffect } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { CareerChatMessage, ChatSessionMetadata } from '@/types/database/analytics';
import { useMessageOperations } from './useMessageOperations';
import { useSessionManagement } from './useSessionManagement';
import { useEnhancedSessionInitialization } from './useEnhancedSessionInitialization';
import { useRealtimeMessages } from './useRealtimeMessages';
import { UseChatSessionReturn } from './types';

export function useChatSession(): UseChatSessionReturn {
  const { session } = useAuthSession();
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [isFetchingPastSessions, setIsFetchingPastSessions] = useState(false);
  const [sessionMetadata, setSessionMetadata] = useState<ChatSessionMetadata | null>(null);

  const userId = session?.user?.id;
  
  const { addMessage } = useMessageOperations(sessionId, messages, setMessages);
  
  const { initializeChat, sendFirstQuestion } = useEnhancedSessionInitialization(
    userId, 
    setSessionId, 
    setMessages, 
    setIsLoading, 
    addMessage,
    setSessionMetadata
  );
  
  const { 
    endCurrentSession,
    startNewSession,
    fetchPastSessions: fetchPastSessionsImpl,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    updateSessionMetadata
  } = useSessionManagement(
    sessionId, 
    setSessionId, 
    setMessages, 
    pastSessions, 
    setPastSessions, 
    initializeChat,
    userId || '',
    sessionMetadata,
    setSessionMetadata
  );
  
  const fetchPastSessions = async () => {
    setIsFetchingPastSessions(true);
    await fetchPastSessionsImpl();
    setIsFetchingPastSessions(false);
  };
  
  useRealtimeMessages(sessionId, messages, setMessages);
  
  useEffect(() => {
    initializeChat();
  }, [session]);

  return { 
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
  };
}
