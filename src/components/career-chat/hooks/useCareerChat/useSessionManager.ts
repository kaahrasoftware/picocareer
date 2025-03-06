
import { Dispatch, SetStateAction } from 'react';
import { useChatSession } from '../chat-session';
import { ChatSessionMetadata } from './types';

export function useSessionManager(
  setIsSessionComplete: Dispatch<SetStateAction<boolean>>,
  setCurrentCategory: Dispatch<SetStateAction<string | null>>,
  setQuestionProgress: Dispatch<SetStateAction<number>>
) {
  const { 
    sessionId,
    sessionMetadata,
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession: endSession,
    startNewSession: startSession,
    resumeSession: resumeExistingSession,
    deleteSession: deleteExistingSession,
    updateSessionTitle: updateTitle,
    updateSessionMetadata: updateMetadata
  } = useChatSession();

  // Wrap the session functions to handle UI state updates
  const endCurrentSession = async () => {
    await endSession();
  };

  const startNewSession = async () => {
    await startSession();
    
    // Reset UI state
    setIsSessionComplete(false);
    setCurrentCategory('education'); // Starting category
    setQuestionProgress(0);
  };

  const resumeSession = async (sessionId: string) => {
    await resumeExistingSession(sessionId);
    
    // Session metadata will be loaded by the session hook
    // Progress tracker will update from metadata via useEffect
  };

  const deleteSession = async (sessionId: string) => {
    await deleteExistingSession(sessionId);
  };

  const updateSessionTitle = async (sessionId: string, title: string) => {
    await updateTitle(sessionId, title);
  };

  const updateSessionMetadata = async (metadata: Partial<ChatSessionMetadata>) => {
    await updateMetadata(metadata);
  };

  return {
    sessionId,
    sessionMetadata,
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    updateSessionMetadata
  };
}
