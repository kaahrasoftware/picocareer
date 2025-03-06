
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareerChatMessage } from '@/types/database/analytics';
import { v4 as uuidv4 } from 'uuid';

export function useCareerAnalysis(sessionId: string, addMessage: (message: CareerChatMessage) => Promise<any>) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeResponses = useCallback(async (messages: CareerChatMessage[]) => {
    if (!sessionId) return;
    
    setIsAnalyzing(true);
    
    try {
      // Create an analyzing message to show the user we're working on recommendations
      const analyzingMessage: CareerChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        message_type: 'system',
        content: "Analyzing your responses to generate personalized career recommendations...",
        metadata: { isAnalyzing: true },
        created_at: new Date().toISOString()
      };
      
      await addMessage(analyzingMessage);
      
      // Prepare the request to the AI service
      const userMessages = messages
        .filter(m => m.message_type === 'user')
        .map(m => ({
          role: 'user',
          content: m.content
        }));
      
      const questionMessages = messages
        .filter(m => m.message_type === 'bot' && m.metadata?.structuredMessage?.type === 'question')
        .map(m => ({
          role: 'assistant',
          content: m.content
        }));
        
      const messageHistory = [];
      
      // Interleave questions and answers for context
      for (let i = 0; i < Math.max(questionMessages.length, userMessages.length); i++) {
        if (i < questionMessages.length) {
          messageHistory.push(questionMessages[i]);
        }
        if (i < userMessages.length) {
          messageHistory.push(userMessages[i]);
        }
      }
      
      // Call the edge function to generate recommendations
      const response = await supabase.functions.invoke('career-chat-ai', {
        body: {
          type: 'recommendation',
          sessionId,
          messages: messageHistory,
          instructions: {
            generateRecommendations: true,
            userResponses: userMessages.map(m => m.content)
          }
        }
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to generate recommendations');
      }

      if (response.data?.error) {
        console.error('AI service error:', response.data.error);
        throw new Error(response.data.error);
      }
      
      // Add the recommendation message
      if (response.data?.message) {
        const recommendationMessage: CareerChatMessage = {
          id: uuidv4(),
          session_id: sessionId,
          message_type: 'recommendation',
          content: response.data.message,
          metadata: {
            ...(response.data.metadata || {}),
            structuredMessage: response.data.structuredMessage,
            rawResponse: response.data.rawResponse,
            isRecommendation: true
          },
          created_at: new Date().toISOString()
        };
        
        await addMessage(recommendationMessage);
      }
      
      // Add the session end message
      const sessionEndMessage: CareerChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        message_type: 'session_end',
        content: "Thank you for completing your career assessment! I've analyzed your responses and provided career recommendations above. This session is now complete. You can start a new session anytime to explore different career paths or retake the assessment.",
        metadata: {
          isSessionEnd: true,
          completionType: "career_recommendations",
          suggestions: [
            "Start a new career assessment",
            "Explore these career paths in detail",
            "Save these recommendations"
          ]
        },
        created_at: new Date().toISOString()
      };
      
      await addMessage(sessionEndMessage);
      
    } catch (error) {
      console.error('Error analyzing responses:', error);
      
      // Add error message
      await addMessage({
        id: uuidv4(),
        session_id: sessionId,
        message_type: 'system',
        content: "I'm sorry, I encountered an error generating career recommendations. Please try again or start a new session.",
        metadata: { error: true },
        created_at: new Date().toISOString()
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, addMessage]);

  return {
    isAnalyzing,
    analyzeResponses
  };
}
