
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { WELCOME_MESSAGES } from '../constants';
import { CareerChatMessage } from '@/types/database/analytics';
import { useAuthSession } from '@/hooks/useAuthSession';

export function useChatSession() {
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { session } = useAuthSession();

  // Function to create a new chat session
  const createChatSession = async () => {
    const { data, error } = await supabase
      .from('career_chat_sessions')
      .insert({
        profile_id: session?.user.id || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }

    return data.id;
  };

  // Function to get an existing chat session
  const getExistingSession = async () => {
    if (!session?.user.id) return null;

    const { data, error } = await supabase
      .from('career_chat_sessions')
      .select()
      .eq('profile_id', session.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching existing session:', error);
      return null;
    }

    return data?.id || null;
  };

  // Function to get messages for a session
  const getSessionMessages = async (sid: string) => {
    const { data, error } = await supabase
      .from('career_chat_messages')
      .select()
      .eq('session_id', sid)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }

    // Type assertion to convert message_type from string to the expected enum type
    const typedMessages = data.map(msg => ({
      ...msg,
      message_type: msg.message_type as 'user' | 'bot' | 'system' | 'recommendation'
    })) as CareerChatMessage[];

    return typedMessages;
  };

  // Initialize chat session and messages
  useEffect(() => {
    async function initializeChat() {
      setIsLoading(true);
      try {
        // Get or create session
        let sid = await getExistingSession();
        if (!sid) {
          sid = await createChatSession();
        }
        
        setSessionId(sid);

        // Get existing messages or set welcome messages
        if (sid) {
          const existingMessages = await getSessionMessages(sid);
          if (existingMessages.length > 0) {
            setMessages(existingMessages);
          } else {
            // Add welcome messages to the database and state
            for (const msg of WELCOME_MESSAGES) {
              await addMessage({
                ...msg,
                session_id: sid
              });
            }
            setMessages(WELCOME_MESSAGES);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeChat();
  }, [session?.user.id]);

  // Function to add a message to the conversation
  const addMessage = async (message: Omit<CareerChatMessage, 'id'>): Promise<CareerChatMessage | null> => {
    if (!sessionId) return null;

    const { data, error } = await supabase
      .from('career_chat_messages')
      .insert({
        ...message,
        session_id: sessionId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    // Update the messages state with the new message
    setMessages(prev => [
      ...prev, 
      {
        ...data,
        message_type: data.message_type as 'user' | 'bot' | 'system' | 'recommendation'
      } as CareerChatMessage
    ]);

    return {
      ...data,
      message_type: data.message_type as 'user' | 'bot' | 'system' | 'recommendation'
    } as CareerChatMessage;
  };

  return {
    messages,
    sessionId,
    isLoading,
    addMessage
  };
}
