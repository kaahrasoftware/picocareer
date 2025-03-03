
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';

export async function createChatSession(profileId: string) {
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
}

export function useSessionInitialization(
  userId: string | undefined,
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<CareerChatMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addMessage: (message: CareerChatMessage) => Promise<any>
) {
  
  const initializeChat = async (forceNew = false) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const profileId = userId;
    
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

  return { initializeChat };
}
