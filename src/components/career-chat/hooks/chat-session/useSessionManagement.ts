
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';

export function useSessionManagement(
  sessionId: string | null, 
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<CareerChatMessage[]>>,
  pastSessions: any[],
  setPastSessions: React.Dispatch<React.SetStateAction<any[]>>,
  initializeChat: (forceNew?: boolean) => Promise<void>,
  userId: string
) {
  
  const endCurrentSession = async () => {
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
      
      // Start a new session
      await initializeChat(true);
    } catch (error) {
      console.error('Error ending current session:', error);
    }
  };
  
  const startNewSession = async () => {
    try {
      // End current session first if there is one
      if (sessionId) {
        await endCurrentSession();
      } else {
        // If there's no current session, just initialize a new one
        await initializeChat(true);
      }
    } catch (error) {
      console.error('Error starting new session:', error);
    }
  };
  
  const fetchPastSessions = async () => {
    if (!userId) return;
    
    try {
      // Get all completed or archived sessions for the user
      const { data, error } = await supabase
        .from('career_chat_sessions')
        .select(`
          id, 
          status, 
          created_at, 
          completed_at,
          title,
          career_chat_messages:career_chat_messages(count)
        `)
        .eq('profile_id', userId)
        .in('status', ['completed', 'archived'])
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching past sessions:', error);
        return;
      }
      
      const processedSessions = data.map(session => ({
        ...session,
        message_count: session.career_chat_messages[0]?.count || 0
      }));
      
      setPastSessions(processedSessions);
    } catch (error) {
      console.error('Error fetching past sessions:', error);
    }
  };
  
  const resumeSession = async (targetSessionId: string) => {
    if (!userId) return;
    
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
      if (sessionId) {
        await supabase
          .from('career_chat_sessions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId);
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
    }
  };
  
  const deleteSession = async (targetSessionId: string) => {
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
      if (sessionId === targetSessionId) {
        setSessionId(null);
        setMessages([]);
        initializeChat(true);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };
  
  const updateSessionTitle = async (targetSessionId: string, title: string) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('career_chat_sessions')
        .update({ title })
        .eq('id', targetSessionId)
        .eq('profile_id', userId);
        
      if (error) {
        console.error('Error updating session title:', error);
        return;
      }
      
      // Update local state if needed
      if (pastSessions.length > 0) {
        setPastSessions(prevSessions => 
          prevSessions.map(s => 
            s.id === targetSessionId ? { ...s, title } : s
          )
        );
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  return {
    endCurrentSession,
    startNewSession,
    fetchPastSessions,
    resumeSession,
    deleteSession,
    updateSessionTitle
  };
}
