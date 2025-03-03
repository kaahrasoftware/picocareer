
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CareerChatMessage } from '@/types/database/analytics';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { WELCOME_MESSAGES } from '../constants';

export function useChatSession() {
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuthSession();

  // Initialize or retrieve the chat session
  useEffect(() => {
    async function initSession() {
      // Try to retrieve an existing active session
      if (session?.user?.id) {
        const { data: existingSessions } = await supabase
          .from('career_chat_sessions')
          .select('*')
          .eq('profile_id', session.user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingSessions && existingSessions.length > 0) {
          setSessionId(existingSessions[0].id);
          
          // Load messages for this session
          const { data: existingMessages } = await supabase
            .from('career_chat_messages')
            .select('*')
            .eq('session_id', existingSessions[0].id)
            .order('created_at', { ascending: true });
          
          if (existingMessages && existingMessages.length > 0) {
            setMessages(existingMessages);
          } else {
            // If no messages found, initialize with welcome messages
            setMessages(WELCOME_MESSAGES.map(msg => ({
              ...msg,
              session_id: existingSessions[0].id
            })));

            // Save welcome messages to the database
            await Promise.all(WELCOME_MESSAGES.map(msg => 
              addMessage({
                ...msg,
                session_id: existingSessions[0].id
              })
            ));
          }
        } else {
          // Create a new session
          const newSessionId = uuidv4();
          const { error } = await supabase
            .from('career_chat_sessions')
            .insert({
              id: newSessionId,
              profile_id: session.user.id,
              status: 'active',
              created_at: new Date().toISOString(),
              last_message_at: new Date().toISOString()
            });

          if (error) {
            console.error('Error creating session:', error);
            return;
          }

          setSessionId(newSessionId);
          
          // Initialize with welcome messages
          setMessages(WELCOME_MESSAGES.map(msg => ({
            ...msg,
            session_id: newSessionId
          })));

          // Save welcome messages to the database
          await Promise.all(WELCOME_MESSAGES.map(msg => 
            addMessage({
              ...msg,
              session_id: newSessionId
            })
          ));
        }
      } else {
        // Handle anonymous users
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        setMessages(WELCOME_MESSAGES.map(msg => ({
          ...msg,
          session_id: newSessionId
        })));
      }
      
      setIsLoading(false);
    }

    initSession();
  }, [session]);

  // Function to add a message to the conversation
  async function addMessage(message: Omit<CareerChatMessage, 'id'>) {
    if (!message.session_id) {
      console.error('Cannot add message: No session ID');
      return null;
    }

    // Optimistically update the UI
    const tempId = uuidv4();
    const tempMessage = { ...message, id: tempId };
    setMessages(prev => [...prev, tempMessage]);

    // Save to database
    const { data, error } = await supabase
      .from('career_chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      // Remove the temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      return null;
    }

    // Update last_message_at in the session
    await supabase
      .from('career_chat_sessions')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', message.session_id);

    // Replace the temp message with the actual one from the database
    setMessages(prev => prev.map(m => m.id === tempId ? data : m));

    return data;
  }

  return {
    messages,
    sessionId,
    isLoading,
    addMessage
  };
}
