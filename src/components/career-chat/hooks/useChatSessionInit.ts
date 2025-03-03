
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';
import { v4 as uuidv4 } from 'uuid';

export function useChatSessionInit() {
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Creates a new chat session in the database
   */
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

  /**
   * Initialize a chat session, either by finding an existing one or creating a new one
   */
  const initializeChat = async (profileId: string, forceNew = false, addMessage: (message: CareerChatMessage) => Promise<any>) => {
    if (!profileId) {
      setIsLoading(false);
      return { chatId: null, chatMessages: [] };
    }
    
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
    
    setIsLoading(false);
    return { chatId, chatMessages };
  };

  return {
    isLoading,
    setIsLoading,
    createChatSession,
    initializeChat
  };
}
