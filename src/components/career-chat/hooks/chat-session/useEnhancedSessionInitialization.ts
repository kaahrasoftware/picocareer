
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage, ChatSessionMetadata } from '@/types/database/analytics';
import { v4 as uuidv4 } from 'uuid';
import { callCareerChatAI } from '../../services/aiChatService';

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

export function useEnhancedSessionInitialization(
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
        
        const { data: sessionMessages } = await supabase
          .from('career_chat_messages')
          .select('*')
          .eq('session_id', chatSession.id)
          .order('message_index', { ascending: true });
          
        if (sessionMessages) {
          chatMessages = sessionMessages.map(msg => ({
            ...msg,
            message_type: msg.message_type as "system" | "user" | "bot" | "recommendation" | "session_end"
          })) as CareerChatMessage[];
        }
      }
    }
    
    // If no existing session, create a new one
    if (!chatSession) {
      const initialMetadata: ChatSessionMetadata = {
        startedAt: new Date().toISOString(),
        questionCounts: {
          education: 0,
          skills: 0,
          workstyle: 0,
          goals: 0
        },
        overallProgress: 0,
        isComplete: false,
        lastCategory: 'education'
      };
      
      chatSession = await createChatSession(profileId, initialMetadata);
      
      if (chatSession) {
        const sessionId = chatSession.id;
        
        // Add welcome message
        const welcomeMessage: CareerChatMessage = {
          id: uuidv4(),
          session_id: sessionId,
          message_type: "system",
          content: 'Hi there! I\'m your Career Discovery Assistant. I\'ll ask you some questions about your education, skills, work preferences, and goals to help suggest career paths that might be a good fit for you.',
          metadata: {
            hasOptions: true,
            suggestions: [
              'Begin Assessment'
            ]
          },
          created_at: new Date().toISOString()
        };
        
        const savedWelcomeMessage = await addMessage(welcomeMessage);
        if (savedWelcomeMessage) {
          chatMessages = [savedWelcomeMessage];
        }
      }
    }
    
    if (chatSession) {
      setSessionId(chatSession.id);
      setMessages(chatMessages);
      setSessionMetadata(chatSession.session_metadata as unknown as ChatSessionMetadata || null);
    }
    setIsLoading(false);
  };

  const sendFirstQuestion = async (sessionId: string) => {
    try {
      const aiResponse = await callCareerChatAI({
        sessionId,
        messages: [],
        userMessage: 'BEGIN_ASSESSMENT',
        currentCategory: 'education',
        questionCount: 0
      });

      const questionMessage: CareerChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        message_type: 'bot',
        content: aiResponse.content.question || "Let's start with your educational background. What field did you study or are you currently studying?",
        metadata: {
          structuredMessage: aiResponse,
          category: 'education'
        },
        created_at: new Date().toISOString()
      };

      await addMessage(questionMessage);
    } catch (error) {
      console.error('Error sending first question:', error);
      
      // Fallback question
      const fallbackMessage: CareerChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        message_type: 'bot',
        content: "Let's start with your educational background. What field did you study or are you currently studying?",
        metadata: {
          category: 'education'
        },
        created_at: new Date().toISOString()
      };

      await addMessage(fallbackMessage);
    }
  };

  return { initializeChat, sendFirstQuestion };
}
