
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage, CareerChatSession, ChatSessionMetadata } from '@/types/database/analytics';

export function useSessionManagement(
  sessionId: string | null, 
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<CareerChatMessage[]>>,
  pastSessions: CareerChatSession[],
  setPastSessions: React.Dispatch<React.SetStateAction<any[]>>,
  initializeChat: (forceNew?: boolean) => Promise<void>,
  userId: string,
  sessionMetadata: ChatSessionMetadata | null,
  setSessionMetadata: React.Dispatch<React.SetStateAction<ChatSessionMetadata | null>>
) {
  
  const endCurrentSession = async () => {
    if (!sessionId) return;
    
    try {
      // Get the most recent messages to generate a title if one doesn't exist
      let sessionTitle = sessionMetadata?.title;
      
      if (!sessionTitle) {
        // Find first user message for title generation
        const userMessages = await supabase
          .from('career_chat_messages')
          .select('content')
          .eq('session_id', sessionId)
          .eq('message_type', 'user')
          .order('created_at', { ascending: true })
          .limit(1);
          
        if (userMessages.data && userMessages.data.length > 0) {
          // Create a title from the first user message
          const firstMsg = userMessages.data[0].content;
          sessionTitle = firstMsg.length > 30 
            ? `${firstMsg.substring(0, 30)}...` 
            : firstMsg;
        } else {
          sessionTitle = `Chat session ${new Date().toLocaleDateString()}`;
        }
      }
      
      // Update final metadata
      const finalMetadata: ChatSessionMetadata = {
        ...sessionMetadata,
        title: sessionTitle,
        isComplete: true,
        completedAt: new Date().toISOString()
      };
      
      // Update the current session status to completed
      const { error } = await supabase
        .from('career_chat_sessions')
        .update({ 
          status: 'completed',
          last_active_at: new Date().toISOString(),
          title: sessionTitle,
          session_metadata: finalMetadata
        })
        .eq('id', sessionId);
        
      if (error) {
        console.error('Error ending session:', error);
        return;
      }
      
      // Update local state
      setSessionMetadata(finalMetadata);
      
      console.log('Session completed successfully:', sessionId);
    } catch (error) {
      console.error('Error ending current session:', error);
    }
  };
  
  const startNewSession = async () => {
    try {
      // End current session first if there is one
      if (sessionId) {
        await endCurrentSession();
      }
      
      // Initialize a new chat session
      await initializeChat(true);
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
          last_active_at,
          title,
          session_metadata,
          total_messages,
          progress_data
        `)
        .eq('profile_id', userId)
        .in('status', ['completed', 'archived'])
        .order('last_active_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching past sessions:', error);
        return;
      }
      
      setPastSessions(data || []);
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
        .select('*, session_metadata')
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
            last_active_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      }
      
      // Reactivate the target session
      await supabase
        .from('career_chat_sessions')
        .update({ 
          status: 'active',
          last_active_at: new Date().toISOString()
        })
        .eq('id', targetSessionId);
      
      // Fetch messages for the resumed session
      const { data: messagesData, error: messagesError } = await supabase
        .from('career_chat_messages')
        .select('*')
        .eq('session_id', targetSessionId)
        .order('message_index', { ascending: true });
        
      if (messagesError) {
        console.error('Error fetching messages for resumed session:', messagesError);
        return;
      }
      
      // Update state
      setSessionId(targetSessionId);
      setMessages(messagesData || []);
      setSessionMetadata(sessionData.session_metadata || null);
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
        setSessionMetadata(null);
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
        .update({ 
          title,
          session_metadata: { 
            ...(sessionMetadata || {}),
            title
          }
        })
        .eq('id', targetSessionId)
        .eq('profile_id', userId);
        
      if (error) {
        console.error('Error updating session title:', error);
        return;
      }
      
      // Update local state
      if (sessionId === targetSessionId) {
        setSessionMetadata(prev => prev ? { ...prev, title } : { title });
      }
      
      // Update past sessions list if needed
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
  
  const updateSessionMetadata = async (metadata: Partial<ChatSessionMetadata>) => {
    if (!sessionId || !userId) return;
    
    try {
      // Merge with existing metadata
      const updatedMetadata = { ...(sessionMetadata || {}), ...metadata };
      
      const { error } = await supabase
        .from('career_chat_sessions')
        .update({ 
          session_metadata: updatedMetadata,
          last_active_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('profile_id', userId);
        
      if (error) {
        console.error('Error updating session metadata:', error);
        return;
      }
      
      // Update local state
      setSessionMetadata(updatedMetadata);
      
    } catch (error) {
      console.error('Error updating session metadata:', error);
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
