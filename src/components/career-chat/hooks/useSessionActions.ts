
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';

export function useSessionActions() {
  /**
   * End the current active session
   */
  const endCurrentSession = async (
    sessionId: string | null, 
    setMessages: (msgs: CareerChatMessage[]) => void, 
    setSessionId: (id: string | null) => void,
    initializeChat: (profileId: string, forceNew: boolean, addMessage: any) => Promise<any>
  ) => {
    if (!sessionId) return;
    
    try {
      // Update the current session status to completed
      const { error } = await supabase
        .from('career_chat_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);
        
      if (error) {
        console.error('Error ending session:', error);
        return;
      }
      
      // Clear the current messages and session
      setMessages([]);
      setSessionId(null);
    } catch (error) {
      console.error('Error ending current session:', error);
    }
  };
  
  /**
   * Start a new chat session
   */
  const startNewSession = async (
    sessionId: string | null,
    profileId: string,
    endCurrentSession: any,
    initializeChat: any,
    setSessionId: (id: string | null) => void,
    setMessages: (msgs: CareerChatMessage[]) => void,
    addMessage: (message: CareerChatMessage) => Promise<any>
  ) => {
    try {
      // End current session first if there is one
      if (sessionId) {
        await endCurrentSession(sessionId, setMessages, setSessionId, initializeChat);
      }
      
      // Initialize a new session
      const { chatId, chatMessages } = await initializeChat(profileId, true, addMessage);
      setSessionId(chatId);
      setMessages(chatMessages);
      
    } catch (error) {
      console.error('Error starting new session:', error);
    }
  };
  
  /**
   * Resume a previously saved session
   */
  const resumeSession = async (
    targetSessionId: string,
    userId: string,
    currentSessionId: string | null,
    setSessionId: (id: string | null) => void,
    setMessages: (msgs: CareerChatMessage[]) => void,
    setIsLoading: (loading: boolean) => void
  ) => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      // First check if the session exists and belongs to the user
      const { data: sessionData, error: sessionError } = await supabase
        .from('career_chat_sessions')
        .select('*')
        .eq('id', targetSessionId)
        .eq('profile_id', userId)
        .single();
        
      if (sessionError || !sessionData) {
        console.error('Session not found or unauthorized:', sessionError);
        return;
      }
      
      // If the current session is active, end it first
      if (currentSessionId) {
        await supabase
          .from('career_chat_sessions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', currentSessionId);
      }
      
      // Reactivate the target session
      await supabase
        .from('career_chat_sessions')
        .update({ 
          status: 'active',
          completed_at: null
        })
        .eq('id', targetSessionId);
      
      // Fetch messages for the resumed session
      const { data: messagesData, error: messagesError } = await supabase
        .from('career_chat_messages')
        .select('*')
        .eq('session_id', targetSessionId)
        .order('created_at', { ascending: true });
        
      if (messagesError) {
        console.error('Error fetching messages for resumed session:', messagesError);
        return;
      }
      
      // Update state
      setSessionId(targetSessionId);
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error resuming session:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Delete a chat session and its messages
   */
  const deleteSession = async (
    targetSessionId: string, 
    userId: string,
    currentSessionId: string | null,
    setSessionId: (id: string | null) => void,
    setMessages: (msgs: CareerChatMessage[]) => void,
    setPastSessions: (sessions: any[]) => void,
    initializeChat: any,
    addMessage: (message: CareerChatMessage) => Promise<any>
  ) => {
    if (!userId) return;
    
    try {
      // First verify the session belongs to the user
      const { data, error } = await supabase
        .from('career_chat_sessions')
        .select('profile_id')
        .eq('id', targetSessionId)
        .single();
        
      if (error || data.profile_id !== userId) {
        console.error('Unauthorized session deletion attempt:', error);
        return;
      }
      
      // Delete the messages first (foreign key constraint)
      const { error: messagesError } = await supabase
        .from('career_chat_messages')
        .delete()
        .eq('session_id', targetSessionId);
        
      if (messagesError) {
        console.error('Error deleting session messages:', messagesError);
        return;
      }
      
      // Then delete the session
      const { error: sessionError } = await supabase
        .from('career_chat_sessions')
        .delete()
        .eq('id', targetSessionId);
        
      if (sessionError) {
        console.error('Error deleting session:', sessionError);
        return;
      }
      
      // Update the past sessions list
      setPastSessions(prevSessions => 
        prevSessions.filter(s => s.id !== targetSessionId)
      );
      
      // If we deleted the current session, reset state
      if (currentSessionId === targetSessionId) {
        setSessionId(null);
        setMessages([]);
        const { chatId, chatMessages } = await initializeChat(userId, true, addMessage);
        setSessionId(chatId);
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  return {
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession
  };
}
