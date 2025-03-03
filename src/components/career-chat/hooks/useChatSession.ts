
import { useState, useEffect } from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { WELCOME_MESSAGES } from '../constants';

export function useChatSession() {
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize or get existing session
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      try {
        // Check for auth user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // For now, create a demo session without requiring auth
          const tempSessionId = uuidv4();
          setSessionId(tempSessionId);
          
          // Set welcome messages with the session ID
          const welcomeWithSession = WELCOME_MESSAGES.map(msg => ({
            ...msg,
            session_id: tempSessionId,
          }));
          
          setMessages(welcomeWithSession);
          setIsLoading(false);
          return;
        }
        
        // Get most recent active session or create new one
        const { data: existingSessions, error: sessionError } = await supabase
          .from('career_chat_sessions')
          .select('*')
          .eq('profile_id', user.id)
          .eq('status', 'active')
          .order('last_message_at', { ascending: false })
          .limit(1);
          
        if (sessionError) {
          console.error("Error fetching sessions:", sessionError);
          toast("Error loading chat session");
          setIsLoading(false);
          return;
        }
        
        let currentSessionId;
        
        if (existingSessions && existingSessions.length > 0) {
          // Use existing session
          currentSessionId = existingSessions[0].id;
          setSessionId(currentSessionId);
          
          // Fetch existing messages for this session
          const { data: existingMessages, error: messagesError } = await supabase
            .from('career_chat_messages')
            .select('*')
            .eq('session_id', currentSessionId)
            .order('created_at', { ascending: true });
            
          if (messagesError) {
            console.error("Error fetching messages:", messagesError);
            toast("Error loading chat messages");
          } else if (existingMessages && existingMessages.length > 0) {
            // Cast the messages to the correct type
            const typedMessages = existingMessages.map(msg => ({
              ...msg,
              message_type: msg.message_type as 'bot' | 'user' | 'system' | 'recommendation'
            }));
            
            setMessages(typedMessages as CareerChatMessage[]);
          }
        } else {
          // Create new session
          const newSessionId = uuidv4();
          const { error: createError } = await supabase
            .from('career_chat_sessions')
            .insert({
              id: newSessionId,
              profile_id: user.id,
              status: 'active',
              last_message_at: new Date().toISOString()
            });
            
          if (createError) {
            console.error("Error creating session:", createError);
            toast("Error creating chat session");
            setIsLoading(false);
            return;
          }
          
          currentSessionId = newSessionId;
          setSessionId(currentSessionId);
          
          // Add welcome messages to database
          const welcomeMessages = WELCOME_MESSAGES.map(msg => ({
            ...msg,
            session_id: currentSessionId,
          }));
          
          const { error: messagesError } = await supabase
            .from('career_chat_messages')
            .insert(welcomeMessages);
            
          if (messagesError) {
            console.error("Error adding welcome messages:", messagesError);
            toast("Error initializing chat");
          }
          
          setMessages(welcomeMessages);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast("Error initializing chat");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, []);

  // Function to add a message to state and database
  const addMessage = async (message: Omit<CareerChatMessage, 'id'>) => {
    if (!sessionId) return null;
    
    const messageWithId = {
      ...message,
      id: uuidv4()
    };
    
    // Ensure message_type is cast to the expected type
    const typedMessage = {
      ...messageWithId,
      message_type: messageWithId.message_type as 'bot' | 'user' | 'system' | 'recommendation'
    };
    
    // Optimistically update UI
    setMessages(prev => [...prev, typedMessage]);
    
    // Save to database
    const { error } = await supabase
      .from('career_chat_messages')
      .insert(messageWithId);
      
    if (error) {
      console.error("Error saving message:", error);
      toast("Error saving message");
    }
    
    // Update session last_message_at
    if (sessionId) {
      await supabase
        .from('career_chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', sessionId);
    }
    
    return typedMessage;
  };

  return {
    messages,
    sessionId,
    isLoading,
    addMessage,
    setMessages
  };
}
