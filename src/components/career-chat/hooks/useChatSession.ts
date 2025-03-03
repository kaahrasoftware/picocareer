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

  const initializeChat = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const profileId = session.user.id;
    
    // First try to find an existing active session
    const { data: existingSessions } = await supabase
      .from('career_chat_sessions')
      .select('*, career_chat_messages(*)')
      .eq('profile_id', profileId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    
    let chatId: string | null = null;
    let chatMessages: CareerChatMessage[] = [];
    
    if (existingSessions && existingSessions.length > 0) {
      chatId = existingSessions[0].id;
      if (existingSessions[0].career_chat_messages) {
        chatMessages = existingSessions[0].career_chat_messages;
      }
    } else {
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

  return { messages, sessionId, isLoading, addMessage };
}
