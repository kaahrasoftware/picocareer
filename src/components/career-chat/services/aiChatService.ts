
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';

export interface AIResponseData {
  type: 'question' | 'recommendation' | 'session_end';
  content: {
    intro?: string;
    question?: string;
    message?: string;
    suggestions?: string[];
    careers?: Array<{
      title: string;
      match_percentage: number;
      description: string;
    }>;
  };
  metadata?: {
    category?: string;
    progress?: {
      current: number;
      total: number;
      overall: number;
    };
  };
}

export interface AIServiceParams {
  sessionId: string;
  messages: CareerChatMessage[];
  userMessage: string;
  currentCategory: string;
  questionCount: number;
}

export async function callCareerChatAI({
  sessionId,
  messages,
  userMessage,
  currentCategory,
  questionCount
}: AIServiceParams): Promise<AIResponseData> {
  try {
    console.log('Calling career-chat-ai function with:', {
      sessionId,
      userMessage,
      currentCategory,
      questionCount,
      messageCount: messages.length
    });

    const { data, error } = await supabase.functions.invoke('career-chat-ai', {
      body: {
        type: 'chat',
        sessionId,
        messages: messages.slice(-10), // Send only recent messages for context
        userMessage,
        currentCategory,
        questionCount,
        messageCount: messages.length
      }
    });

    if (error) {
      console.error('AI service error:', error);
      throw error;
    }

    console.log('AI service response:', data);

    // Return the structured response or create a fallback
    return data || {
      type: 'question',
      content: {
        question: "Could you tell me more about your interests and goals?",
        intro: "Thank you for sharing that with me."
      },
      metadata: {
        category: currentCategory,
        progress: {
          current: questionCount,
          total: 6,
          overall: Math.min(((questionCount / 6) * 100), 100)
        }
      }
    };
  } catch (error) {
    console.error('Error calling AI service:', error);
    
    // Return a fallback question if AI service fails
    return {
      type: 'question',
      content: {
        question: "I'd like to learn more about you. What are you most passionate about?",
        intro: "Thanks for your response."
      },
      metadata: {
        category: currentCategory,
        progress: {
          current: questionCount,
          total: 6,
          overall: Math.min(((questionCount / 6) * 100), 100)
        }
      }
    };
  }
}

export async function generateCareerRecommendations({
  sessionId,
  messages
}: {
  sessionId: string;
  messages: CareerChatMessage[];
}): Promise<AIResponseData> {
  try {
    console.log('Generating career recommendations for session:', sessionId);

    const { data, error } = await supabase.functions.invoke('career-chat-ai', {
      body: {
        type: 'recommendation',
        sessionId,
        messages,
        generateRecommendations: true
      }
    });

    if (error) {
      console.error('Recommendation generation error:', error);
      throw error;
    }

    console.log('Recommendation response:', data);

    return data || {
      type: 'session_end',
      content: {
        message: "Thank you for completing the assessment! Based on your responses, I have some career suggestions for you.",
        careers: [
          {
            title: "Software Developer",
            match_percentage: 85,
            description: "Create software applications and systems using programming languages."
          }
        ],
        suggestions: [
          "Download your results",
          "Start a new assessment",
          "Explore recommended careers"
        ]
      }
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    return {
      type: 'session_end',
      content: {
        message: "Thank you for completing the assessment! I encountered an issue generating detailed recommendations, but I can still help you explore career options.",
        suggestions: [
          "Start a new assessment",
          "Explore career options",
          "Tell me about specific careers"
        ]
      }
    };
  }
}
