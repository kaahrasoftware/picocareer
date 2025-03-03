
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/database/database.types';

interface PastSession {
  id: string;
  status: string;
  created_at: string;
  completed_at?: string;
  title?: string;
  message_count: number;
}

export function usePastSessions() {
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [isFetchingPastSessions, setIsFetchingPastSessions] = useState(false);
  
  /**
   * Fetch past (completed or archived) chat sessions for the current user
   */
  const fetchPastSessions = async (userId: string) => {
    if (!userId) return;
    
    setIsFetchingPastSessions(true);
    
    try {
      // Get all completed or archived sessions for the user
      const { data, error } = await supabase
        .from('career_chat_sessions')
        .select(`
          id, 
          status, 
          created_at, 
          title,
          career_chat_messages(count)
        `)
        .eq('profile_id', userId)
        .in('status', ['completed', 'archived'])
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching past sessions:', error);
        return;
      }
      
      const processedSessions = data.map(session => ({
        id: session.id,
        status: session.status,
        created_at: session.created_at,
        title: session.title || null,
        message_count: session.career_chat_messages[0]?.count || 0
      }));
      
      setPastSessions(processedSessions);
    } catch (error) {
      console.error('Error fetching past sessions:', error);
    } finally {
      setIsFetchingPastSessions(false);
    }
  };
  
  /**
   * Update the title of a session
   */
  const updateSessionTitle = async (targetSessionId: string, title: string, userId: string) => {
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
    pastSessions, 
    setPastSessions, 
    isFetchingPastSessions, 
    fetchPastSessions,
    updateSessionTitle
  };
}
