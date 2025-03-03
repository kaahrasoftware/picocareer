
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';
import { useAuthSession } from '@/hooks/useAuthSession';
import { v4 as uuidv4 } from 'uuid';

export function useChatSession() {
  const { session } = useAuthSession();
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [isFetchingPastSessions, setIsFetchingPastSessions] = useState(false);

  const createChatSession = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('career_chat_sessions')
        .insert({
          profile_id: profileId,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
  };

  const addMessage = async (message: CareerChatMessage) => {
    if (!sessionId) return null;
    
    try {
      // Optimistically add the message to the local state
      setMessages(prevMessages => [...prevMessages, message]);
      
      // If the message already has an ID, it may be a message we're adding manually
      // after receiving from the API, so don't save it again
      if (message.id && !message.id.startsWith('temp-')) {
        return message;
      }
      
      // Otherwise save to the database
      const { data, error } = await supabase
        .from('career_chat_messages')
        .insert({
          session_id: message.session_id,
          message_type: message.message_type,
          content: message.content,
          metadata: message.metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing message:', error);
        throw error;
      }

      // Update the message in our local state with the one from the database
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          (message.id === msg.id) ? data : msg
        )
      );

      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  };

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
    if (!session?.user) return;
    
    setIsFetchingPastSessions(true);
    
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
        .eq('profile_id', session.user.id)
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
    } finally {
      setIsFetchingPastSessions(false);
    }
  };
  
  const resumeSession = async (targetSessionId: string) => {
    if (!session?.user) return;
    
    setIsLoading(true);
    
    try {
      // First check if the session exists and belongs to the user
      const { data: sessionData, error: sessionError } = await supabase
        .from('career_chat_sessions')
        .select('*')
        .eq('id', targetSessionId)
        .eq('profile_id', session.user.id)
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
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteSession = async (targetSessionId: string) => {
    if (!session?.user) return;
    
    try {
      // First verify the session belongs to the user
      const { data, error } = await supabase
        .from('career_chat_sessions')
        .select('profile_id')
        .eq('id', targetSessionId)
        .single();
        
      if (error || data.profile_id !== session.user.id) {
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
    if (!session?.user) return;
    
    try {
      const { error } = await supabase
        .from('career_chat_sessions')
        .update({ title })
        .eq('id', targetSessionId)
        .eq('profile_id', session.user.id);
        
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

  const initializeChat = async (forceNew = false) => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const profileId = session.user.id;
    
    let chatId: string | null = null;
    let chatMessages: CareerChatMessage[] = [];
    
    // Only try to find existing session if not forcing new
    if (!forceNew) {
      // First try to find an existing active session
      const { data: existingSessions } = await supabase
        .from('career_chat_sessions')
        .select('*, career_chat_messages(*)')
        .eq('profile_id', profileId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (existingSessions && existingSessions.length > 0) {
        chatId = existingSessions[0].id;
        if (existingSessions[0].career_chat_messages) {
          chatMessages = existingSessions[0].career_chat_messages;
        }
      }
    }
    
    // If no existing session or forcing new, create a new one
    if (!chatId) {
      // Create a new session
      chatId = await createChatSession(profileId);
      
      if (chatId) {
        // Add initial system message
        const welcomeMessage: CareerChatMessage = {
          session_id: chatId,
          message_type: 'system',
          content: 'Hi there! I\'m Pico, your career advisor. I\'m here to help you explore career paths that align with your interests, skills, and goals. What would you like to discuss today?',
          metadata: {
            hasOptions: true,
            suggestions: [
              'I want to explore career options',
              'I need help with my resume',
              'I have questions about a specific career',
              'I want to change careers'
            ]
          },
          created_at: new Date().toISOString()
        };
        
        const savedMessage = await addMessage(welcomeMessage);
        if (savedMessage) {
          chatMessages = [savedMessage];
        }
      }
    }
    
    setSessionId(chatId);
    setMessages(chatMessages);
    setIsLoading(false);
  };

  useEffect(() => {
    initializeChat();
  }, [session]);

  // Set up real-time updates for new messages
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`career-chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'career_chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          // Avoid duplicating messages that we've already added locally
          const exists = messages.some(msg => msg.id === payload.new.id);
          if (!exists) {
            // Add the new message to our local state
            setMessages(currentMessages => [...currentMessages, payload.new as CareerChatMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, messages]);

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
    updateSessionTitle
  };
}
