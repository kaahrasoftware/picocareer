
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { WELCOME_MESSAGES } from '../constants';
import { CareerChatMessage } from '@/types/database/analytics';
import { useAuthSession } from '@/hooks/useAuthSession';
import { toast } from 'sonner';

export function useChatSession() {
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { session } = useAuthSession();

  // Function to create a new chat session
  const createChatSession = async () => {
    try {
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
        toast.error('Could not create chat session. Please try again later.');
        return null;
      }

      return data.id;
    } catch (err) {
      console.error('Exception creating chat session:', err);
      toast.error('Failed to initialize chat. Please try again.');
      return null;
    }
  };

  // Function to get an existing chat session
  const getExistingSession = async () => {
    if (!session?.user.id) return null;

    try {
      const { data, error } = await supabase
        .from('career_chat_sessions')
        .select()
        .eq('profile_id', session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not "No rows returned" error
          console.error('Error fetching existing session:', error);
          toast.error('Could not retrieve your previous chat. Starting a new one.');
        }
        return null;
      }

      return data?.id || null;
    } catch (err) {
      console.error('Exception fetching existing session:', err);
      return null;
    }
  };

  // Function to get messages for a session
  const getSessionMessages = async (sid: string) => {
    try {
      const { data, error } = await supabase
        .from('career_chat_messages')
        .select()
        .eq('session_id', sid)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error);
        toast.error('Could not load previous messages.');
        return [];
      }

      // Type assertion to convert message_type from string to the expected enum type
      const typedMessages = data.map(msg => ({
        ...msg,
        message_type: msg.message_type as 'user' | 'bot' | 'system' | 'recommendation'
      })) as CareerChatMessage[];

      return typedMessages;
    } catch (err) {
      console.error('Exception fetching chat messages:', err);
      return [];
    }
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
        
        if (!sid) {
          // If we still don't have a session ID, create a non-persistent local session
          // This allows the chat to work even if there are database issues
          sid = 'local-' + uuidv4();
          toast.warning('Using local session only. Your chat history won\'t be saved.');
        }
        
        setSessionId(sid);

        // Get existing messages or set welcome messages
        if (sid) {
          if (sid.startsWith('local-')) {
            // For local sessions, just use the welcome messages
            setMessages(WELCOME_MESSAGES);
          } else {
            const existingMessages = await getSessionMessages(sid);
            if (existingMessages.length > 0) {
              setMessages(existingMessages);
            } else {
              // Add welcome messages to the database and state
              const welcomeMessagesWithIds = [];
              for (const msg of WELCOME_MESSAGES) {
                const savedMsg = await addMessage({
                  ...msg,
                  session_id: sid
                });
                if (savedMsg) welcomeMessagesWithIds.push(savedMsg);
              }
              
              if (welcomeMessagesWithIds.length > 0) {
                setMessages(welcomeMessagesWithIds);
              } else {
                // If DB storage failed, still show local messages
                setMessages(WELCOME_MESSAGES);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to initialize chat. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    initializeChat();
  }, [session?.user.id]);

  // Function to add a message to the conversation
  const addMessage = async (message: Omit<CareerChatMessage, 'id'>): Promise<CareerChatMessage | null> => {
    if (!sessionId) return null;
    
    // For local sessions, create a fake ID and return immediately
    if (sessionId.startsWith('local-')) {
      const localMessage = {
        ...message,
        id: uuidv4(),
        created_at: new Date().toISOString(),
      } as CareerChatMessage;
      
      setMessages(prev => [...prev, localMessage]);
      return localMessage;
    }

    try {
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
        // If DB storage fails, still add to local state with a fake ID
        const localMessage = {
          ...message,
          id: 'local-' + uuidv4(),
          created_at: new Date().toISOString(),
        } as CareerChatMessage;
        
        setMessages(prev => [...prev, localMessage]);
        return localMessage;
      }

      // Update the messages state with the new message
      const typedMessage = {
        ...data,
        message_type: data.message_type as 'user' | 'bot' | 'system' | 'recommendation'
      } as CareerChatMessage;
      
      setMessages(prev => [...prev, typedMessage]);
      return typedMessage;
    } catch (err) {
      console.error('Exception adding message:', err);
      return null;
    }
  };

  return {
    messages,
    sessionId,
    isLoading,
    addMessage
  };
}
