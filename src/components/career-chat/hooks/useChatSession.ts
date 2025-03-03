
import { useState, useEffect } from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useChatSessionInit } from './useChatSessionInit';
import { usePastSessions } from './usePastSessions';
import { useSessionActions } from './useSessionActions';
import { useMessageManagement } from './useMessageManagement';

export function useChatSession() {
  const { session } = useAuthSession();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Compose the functionality from our smaller hooks
  const { isLoading, setIsLoading, initializeChat } = useChatSessionInit();
  const { messages, setMessages, addMessage } = useMessageManagement(sessionId);
  
  const { 
    pastSessions, 
    setPastSessions, 
    isFetchingPastSessions, 
    fetchPastSessions,
    updateSessionTitle
  } = usePastSessions();
  
  const {
    endCurrentSession: endSession,
    startNewSession: startSession,
    resumeSession: resumeExistingSession,
    deleteSession: deleteExistingSession
  } = useSessionActions();

  // Initialize the chat session on component mount or when the user session changes
  useEffect(() => {
    const initSession = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const profileId = session.user.id;
      const { chatId, chatMessages } = await initializeChat(profileId, false, addMessage);
      
      setSessionId(chatId);
      setMessages(chatMessages);
    };
    
    initSession();
  }, [session]);

  // Wrap the session action hooks to provide all required dependencies
  const endCurrentSession = async () => {
    return endSession(
      sessionId,
      setMessages,
      setSessionId,
      initializeChat
    );
  };

  const startNewSession = async () => {
    if (!session?.user) return;
    
    return startSession(
      sessionId,
      session.user.id,
      endCurrentSession,
      initializeChat,
      setSessionId,
      setMessages,
      addMessage
    );
  };

  const resumeSession = async (targetSessionId: string) => {
    if (!session?.user) return;
    
    return resumeExistingSession(
      targetSessionId,
      session.user.id,
      sessionId,
      setSessionId,
      setMessages,
      setIsLoading
    );
  };

  const deleteSession = async (targetSessionId: string) => {
    if (!session?.user) return;
    
    return deleteExistingSession(
      targetSessionId,
      session.user.id,
      sessionId,
      setSessionId,
      setMessages,
      setPastSessions,
      initializeChat,
      addMessage
    );
  };

  // Only provide the wrapped function for updateSessionTitle
  const handleUpdateSessionTitle = async (targetSessionId: string, title: string) => {
    if (!session?.user) return;
    return updateSessionTitle(targetSessionId, title, session.user.id);
  };

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
    updateSessionTitle: handleUpdateSessionTitle
  };
}
