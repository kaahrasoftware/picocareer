
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { CareerChatMessage, CareerChatSession, ChatSessionMetadata } from '@/types/database/analytics';
import { createChatSession } from './useSessionCreation';

export function useSessionManagement(
  sessionId: string | null,
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<CareerChatMessage[]>>,
  pastSessions: CareerChatSession[],
  setPastSessions: React.Dispatch<React.SetStateAction<CareerChatSession[]>>,
  initializeChat: (forceNew?: boolean) => Promise<void>,
  userId: string,
  sessionMetadata: ChatSessionMetadata | null,
  setSessionMetadata: React.Dispatch<React.SetStateAction<ChatSessionMetadata | null>>
) {
  
  const endCurrentSession = async () => {
    if (!sessionId) return;
    
    try {
      // Create end message
      const endMessage: CareerChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        message_type: 'session_end',
        content: 'This chat session has ended. You can start a new conversation or review past conversations from the history panel.',
        created_at: new Date().toISOString()
      };
      
      // Save end message to database
      await supabase
        .from('career_chat_messages')
        .insert(endMessage);
      
      // Update session status and metadata
      const updatedMetadata = {
        ...(sessionMetadata || {}),
        completedAt: new Date().toISOString(),
        isComplete: true
      };
      
      await supabase
        .from('career_chat_sessions')
        .update({
          status: 'completed',
          session_metadata: updatedMetadata as any, // Cast to any to avoid type issues
          last_active_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      // Refresh sessions list and start new session
      await fetchPastSessions();
      await startNewSession();
      
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };
  
  const startNewSession = async () => {
    await initializeChat(true);
  };
  
  const fetchPastSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('career_chat_sessions')
        .select(`
          id, 
          status, 
          created_at, 
          session_metadata,
          progress_data,
          total_messages
        `)
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      setPastSessions(data || []);
    } catch (error) {
      console.error("Error fetching past sessions:", error);
    }
  };
  
  const resumeSession = async (targetSessionId: string) => {
    if (!targetSessionId) return;
    
    try {
      // Get session data
      const { data: session } = await supabase
        .from('career_chat_sessions')
        .select(`
          id, 
          status, 
          created_at, 
          session_metadata,
          progress_data
        `)
        .eq('id', targetSessionId)
        .single();
      
      if (!session) {
        console.error("Session not found");
        return;
      }
      
      // Get session messages
      const { data: messages } = await supabase
        .from('career_chat_messages')
        .select('*')
        .eq('session_id', targetSessionId)
        .order('message_index', { ascending: true });
      
      // Update UI state
      setSessionId(targetSessionId);
      setMessages(messages as unknown as CareerChatMessage[]);
      setSessionMetadata(session.session_metadata as unknown as ChatSessionMetadata);
      
    } catch (error) {
      console.error("Error resuming session:", error);
    }
  };
  
  const deleteSession = async (targetSessionId: string) => {
    try {
      // Delete messages first (due to foreign key constraint)
      await supabase
        .from('career_chat_messages')
        .delete()
        .eq('session_id', targetSessionId);
      
      // Then delete the session
      await supabase
        .from('career_chat_sessions')
        .delete()
        .eq('id', targetSessionId);
      
      // Refresh the past sessions list
      await fetchPastSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };
  
  const updateSessionTitle = async (targetSessionId: string, title: string) => {
    try {
      const { data: session } = await supabase
        .from('career_chat_sessions')
        .select('session_metadata')
        .eq('id', targetSessionId)
        .single();
      
      if (!session) return;
      
      const updatedMetadata = {
        ...(session.session_metadata || {}),
        title
      };
      
      await supabase
        .from('career_chat_sessions')
        .update({
          session_metadata: updatedMetadata
        })
        .eq('id', targetSessionId);
      
      // If the current session's title was updated, update local state
      if (targetSessionId === sessionId) {
        setSessionMetadata(prev => prev ? {...prev, title} : {title});
      }
      
      // Refresh past sessions to show the updated title
      await fetchPastSessions();
    } catch (error) {
      console.error("Error updating session title:", error);
    }
  };
  
  const updateSessionMetadata = async (metadata: Partial<ChatSessionMetadata>) => {
    if (!sessionId || !sessionMetadata) return;
    
    try {
      const updatedMetadata = {
        ...sessionMetadata,
        ...metadata
      };
      
      await supabase
        .from('career_chat_sessions')
        .update({
          session_metadata: updatedMetadata as any // Cast to any to avoid type issues
        })
        .eq('id', sessionId);
      
      setSessionMetadata(updatedMetadata);
    } catch (error) {
      console.error("Error updating session metadata:", error);
    }
  };
  
  return {
    endCurrentSession,
    startNewSession,
    fetchPastSessions,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    updateSessionMetadata
  };
}
