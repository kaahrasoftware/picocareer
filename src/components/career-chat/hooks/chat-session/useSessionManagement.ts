
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
      const currentMetadata = sessionMetadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        completedAt: new Date().toISOString(),
        isComplete: true
      };
      
      await supabase
        .from('career_chat_sessions')
        .update({
          status: 'completed',
          session_metadata: updatedMetadata,
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
      console.log('Fetching past sessions for authenticated user...');
      
      // Get current auth state for debugging
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current authenticated user:', user?.id);
      
      if (!user) {
        console.warn('No authenticated user found');
        setPastSessions([]);
        return;
      }

      // Rely on RLS policy to filter sessions - remove redundant .eq('profile_id', userId)
      const { data, error } = await supabase
        .from('career_chat_sessions')
        .select(`
          id, 
          status, 
          created_at, 
          session_metadata,
          progress_data,
          total_messages,
          last_active_at
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }
      
      console.log('Raw sessions data from database:', data);
      console.log('Number of sessions returned:', data?.length || 0);
      
      // Convert data to proper type with proper handling of missing fields
      const typedSessions: CareerChatSession[] = (data || []).map(session => {
        // Ensure progress_data has the correct structure
        const progressData = typeof session.progress_data === 'object' && session.progress_data !== null ? 
          session.progress_data as any : 
          { education: 0, skills: 0, workstyle: 0, goals: 0, overall: 0 };
          
        return {
          id: session.id,
          status: session.status || 'active',
          created_at: session.created_at || new Date().toISOString(),
          session_metadata: (session.session_metadata as ChatSessionMetadata) || {},
          progress_data: progressData,
          total_messages: session.total_messages || 0,
          last_active_at: session.last_active_at || session.created_at || new Date().toISOString()
        };
      });
      
      console.log('Processed sessions for display:', typedSessions);
      setPastSessions(typedSessions);
    } catch (error) {
      console.error("Error fetching past sessions:", error);
      // Set empty array on error to prevent UI issues
      setPastSessions([]);
    }
  };
  
  const resumeSession = async (targetSessionId: string) => {
    if (!targetSessionId) return;
    
    try {
      console.log('Resuming session:', targetSessionId);
      
      // Get session data - RLS will ensure user can only access their own sessions
      const { data: session, error: sessionError } = await supabase
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
      
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        return;
      }
      
      if (!session) {
        console.error("Session not found or access denied");
        return;
      }
      
      // Get session messages - RLS will ensure user can only access their own messages
      const { data: messages, error: messagesError } = await supabase
        .from('career_chat_messages')
        .select('*')
        .eq('session_id', targetSessionId)
        .order('message_index', { ascending: true });
      
      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return;
      }
      
      if (messages) {
        // Convert message_type to the proper type
        const typedMessages = messages.map(msg => {
          const typedMsg = { 
            ...msg,
            message_type: msg.message_type as "system" | "user" | "bot" | "recommendation" | "session_end"
          };
          return typedMsg as unknown as CareerChatMessage;
        });
        
        // Update UI state
        setSessionId(targetSessionId);
        setMessages(typedMessages);
        // Safe metadata handling
        const safeMetadata = session.session_metadata && typeof session.session_metadata === 'object' 
          ? session.session_metadata as ChatSessionMetadata
          : {};
        setSessionMetadata(safeMetadata);
        
        console.log('Successfully resumed session with', typedMessages.length, 'messages');
      }
      
    } catch (error) {
      console.error("Error resuming session:", error);
    }
  };
  
  const deleteSession = async (targetSessionId: string) => {
    try {
      console.log('Deleting session:', targetSessionId);
      
      // Delete messages first (due to foreign key constraint)
      // RLS will ensure user can only delete their own messages
      const { error: messagesError } = await supabase
        .from('career_chat_messages')
        .delete()
        .eq('session_id', targetSessionId);
      
      if (messagesError) {
        console.error("Error deleting messages:", messagesError);
        throw messagesError;
      }
      
      // Then delete the session
      // RLS will ensure user can only delete their own session
      const { error: sessionError } = await supabase
        .from('career_chat_sessions')
        .delete()
        .eq('id', targetSessionId);
      
      if (sessionError) {
        console.error("Error deleting session:", sessionError);
        throw sessionError;
      }
      
      console.log('Successfully deleted session');
      
      // Refresh the past sessions list
      await fetchPastSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };
  
  const updateSessionTitle = async (targetSessionId: string, title: string) => {
    try {
      // RLS will ensure user can only access their own session
      const { data: session, error: fetchError } = await supabase
        .from('career_chat_sessions')
        .select('session_metadata')
        .eq('id', targetSessionId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching session for title update:", fetchError);
        return;
      }
      
      if (!session) return;
      
      const currentMetadata = session.session_metadata || {};
      // Ensure safe metadata handling
      const safeCurrentMetadata = typeof currentMetadata === 'object' && currentMetadata !== null ? currentMetadata : {};
      const updatedMetadata = {
        ...safeCurrentMetadata,
        title
      };
      
      // RLS will ensure user can only update their own session
      const { error: updateError } = await supabase
        .from('career_chat_sessions')
        .update({
          session_metadata: updatedMetadata
        })
        .eq('id', targetSessionId);
      
      if (updateError) {
        console.error("Error updating session title:", updateError);
        return;
      }
      
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
    if (!sessionId) return;
    
    try {
      const currentMetadata = sessionMetadata || {};
      // Ensure both objects are valid before spreading
      const safeCurrentMetadata = typeof currentMetadata === 'object' && currentMetadata !== null ? currentMetadata : {};
      const safeMetadata = typeof metadata === 'object' && metadata !== null ? metadata : {};
      
      const updatedMetadata = { ...safeCurrentMetadata, ...safeMetadata };
      
      // RLS will ensure user can only update their own session
      const { error } = await supabase
        .from('career_chat_sessions')
        .update({
          session_metadata: updatedMetadata
        })
        .eq('id', sessionId);
      
      if (error) {
        console.error("Error updating session metadata:", error);
        return;
      }
      
      setSessionMetadata(updatedMetadata as ChatSessionMetadata);
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
