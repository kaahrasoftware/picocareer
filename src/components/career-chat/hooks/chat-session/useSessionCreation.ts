
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage, ChatSessionMetadata } from '@/types/database/analytics';
import { v4 as uuidv4 } from 'uuid';

export async function createChatSession(profileId: string, initialMetadata: ChatSessionMetadata = {}) {
  try {
    const { data, error } = await supabase
      .from('career_chat_sessions')
      .insert({
        profile_id: profileId,
        status: 'active',
        session_metadata: initialMetadata,
        progress_data: {
          education: 0,
          skills: 0,
          workstyle: 0,
          goals: 0,
          overall: 0
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }

    return data;
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
  addMessage: (message: CareerChatMessage) => Promise<any>,
  setSessionMetadata: React.Dispatch<React.SetStateAction<ChatSessionMetadata | null>>
) {
  
  const initializeChat = async (forceNew = false) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const profileId = userId;
    
    let chatSession = null;
    let chatMessages: CareerChatMessage[] = [];
    
    // Only try to find existing session if not forcing new
    if (!forceNew) {
      // First try to find an existing active session
      const { data: existingSessions } = await supabase
        .from('career_chat_sessions')
        .select(`
          id, 
          status, 
          created_at, 
          session_metadata,
          progress_data
        `)
        .eq('profile_id', profileId)
        .eq('status', 'active')
        .order('last_active_at', { ascending: false })
        .limit(1);
      
      if (existingSessions && existingSessions.length > 0) {
        chatSession = existingSessions[0];
        
        // Fetch messages for this session
        const { data: sessionMessages } = await supabase
          .from('career_chat_messages')
          .select('*')
          .eq('session_id', chatSession.id)
          .order('message_index', { ascending: true });
          
        if (sessionMessages) {
          chatMessages = sessionMessages;
        }
      }
    }
    
    // If no existing session or forcing new, create a new one
    if (!chatSession) {
      // Initial metadata
      const initialMetadata: ChatSessionMetadata = {
        startedAt: new Date().toISOString(),
        questionCounts: {
          education: 0,
          skills: 0,
          workstyle: 0,
          goals: 0
        },
        overallProgress: 0,
        isComplete: false
      };
      
      // Create a new session
      chatSession = await createChatSession(profileId, initialMetadata);
      
      if (chatSession) {
        const sessionId = chatSession.id;
        
        // Add initial system message
        const welcomeMessage: CareerChatMessage = {
          id: uuidv4(),
          session_id: sessionId,
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
    
    if (chatSession) {
      setSessionId(chatSession.id);
      setMessages(chatMessages);
      setSessionMetadata(chatSession.session_metadata || null);
    }
    setIsLoading(false);
  };

  return { initializeChat };
}
