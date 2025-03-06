
import { useState, useEffect } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { CareerChatMessage, ChatSessionMetadata } from '@/types/database/analytics';
import { useMessageOperations } from './useMessageOperations';
import { useSessionManagement } from './useSessionManagement';
import { useSessionInitialization } from './useSessionCreation';
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
  
  // Operation to add messages to the current session
  const { addMessage } = useMessageOperations(sessionId, messages, setMessages);
  
  // Initialize the chat session
  const { initializeChat } = useSessionInitialization(
    userId, 
    setSessionId, 
    setMessages, 
    setIsLoading, 
    addMessage,
    setSessionMetadata
  );
  
  // Session management operations
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
  
  // Wrap fetchPastSessions to handle loading state
  const fetchPastSessions = async () => {
    setIsFetchingPastSessions(true);
    await fetchPastSessionsImpl();
    setIsFetchingPastSessions(false);
  };
  
  // Set up realtime updates for new messages
  useRealtimeMessages(sessionId, messages, setMessages);
  
  // Initialize chat on session change
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
    sessionMetadata
  };
}
