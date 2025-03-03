
import { CareerChatMessage } from '@/types/database/analytics';
import { AIResponse, QuestionResponse, RecommendationResponse } from '../types/aiResponses';

/**
 * Formats raw AI responses from DeepSeek into standardized message formats
 */
export function formatAIResponse(
  rawResponse: any,
  sessionId: string
): CareerChatMessage {
  // Default metadata
  const defaultMetadata = {
    timestamp: new Date().toISOString(),
  };

  try {
    // Try to parse the response as JSON if it's a string
    const parsedResponse: AIResponse = typeof rawResponse === 'string' 
      ? JSON.parse(rawResponse) 
      : rawResponse;
    
    // Handle question response
    if (parsedResponse.type === 'question') {
      const questionData = parsedResponse.content as QuestionResponse['content'];
      
      return {
        session_id: sessionId,
        message_type: 'bot',
        content: questionData.question,
        metadata: {
          ...defaultMetadata,
          category: questionData.category,
          questionNumber: questionData.questionNumber,
          totalInCategory: questionData.totalInCategory,
          hasOptions: true,
          suggestions: questionData.options.map(opt => opt.label),
          optionsData: questionData.options,
          ...parsedResponse.metadata
        },
        created_at: new Date().toISOString()
      };
    }
    
    // Handle recommendation response
    if (parsedResponse.type === 'recommendation') {
      const recommendationData = parsedResponse.content as RecommendationResponse['content'];
      
      // Format recommendation content
      let formattedContent = recommendationData.summary || '';
      
      // If there's no summary, create one from the data
      if (!formattedContent) {
        formattedContent = 'Career Recommendations\n\n';
        recommendationData.careers.forEach((career, i) => {
          formattedContent += `${i+1}. ${career.title} (${career.match}%)\n${career.description}\n\n`;
        });
        
        if (recommendationData.personalities.length > 0) {
          formattedContent += 'Personality Assessment\n\n';
          recommendationData.personalities.forEach((personality, i) => {
            formattedContent += `${i+1}. ${personality.type} (${personality.match}%)\n${personality.description || ''}\n\n`;
          });
        }
      }
      
      return {
        session_id: sessionId,
        message_type: 'recommendation',
        content: formattedContent,
        metadata: {
          ...defaultMetadata,
          isRecommendation: true,
          careers: recommendationData.careers,
          personalities: recommendationData.personalities,
          mentors: recommendationData.mentors,
          ...parsedResponse.metadata
        },
        created_at: new Date().toISOString()
      };
    }
    
    // Default fallback for other responses
    return {
      session_id: sessionId,
      message_type: 'bot',
      content: typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse),
      metadata: defaultMetadata,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    // If parsing fails, return raw response as-is
    console.error('Error formatting AI response:', error);
    return {
      session_id: sessionId,
      message_type: 'bot',
      content: typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse),
      metadata: defaultMetadata,
      created_at: new Date().toISOString()
    };
  }
}

/**
 * Creates a properly formatted user message
 */
export function formatUserMessage(
  userMessage: string,
  sessionId: string
): CareerChatMessage {
  return {
    session_id: sessionId,
    message_type: 'user',
    content: userMessage,
    metadata: {
      timestamp: new Date().toISOString(),
    },
    created_at: new Date().toISOString()
  };
}
