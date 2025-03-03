
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CareerChatMessage } from '@/types/database/analytics';

export function useCareerAnalysis(sessionId: string, addMessage: (message: CareerChatMessage) => Promise<void>) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeResponses = useCallback(async () => {
    if (!sessionId) return;
    
    setIsAnalyzing(true);
    
    try {
      // Add a system message to inform the user that analysis is starting
      await addMessage({
        session_id: sessionId,
        message_type: 'system',
        content: "I'm analyzing your responses to find career matches that align with your preferences...",
        metadata: {},
        created_at: new Date().toISOString()
      });
      
      // Call the edge function to analyze the chat responses and get career recommendations
      const { data, error } = await supabase.functions.invoke('analyze-career-path', {
        body: { sessionId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || !data.careers || !Array.isArray(data.careers)) {
        throw new Error('Invalid response from career analysis');
      }
      
      // Add a summary message
      await addMessage({
        session_id: sessionId,
        message_type: 'system',
        content: "Based on our conversation, here are some career paths that might be a good fit for you:",
        metadata: {},
        created_at: new Date().toISOString()
      });
      
      // Add career recommendation messages
      for (const career of data.careers) {
        await addMessage({
          session_id: sessionId,
          message_type: 'recommendation',
          content: career.reasoning,
          metadata: {
            career: career.title,
            score: career.score,
            careerId: career.id
          },
          created_at: new Date().toISOString()
        });
      }
      
      // Add next steps message
      await addMessage({
        session_id: sessionId,
        message_type: 'bot',
        content: "Would you like more information about any of these career paths? Or would you like to explore other options?",
        metadata: {
          hasOptions: true,
          suggestions: [
            "Tell me more about these careers",
            "Explore other options",
            "How can I prepare for these careers?",
            "Start a new career assessment"
          ]
        },
        created_at: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error analyzing responses:', error);
      toast.error('Failed to analyze your responses. Please try again.');
      
      await addMessage({
        session_id: sessionId,
        message_type: 'system',
        content: "I'm sorry, I encountered an error while analyzing your responses. Please try again.",
        metadata: { error: true },
        created_at: new Date().toISOString()
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, addMessage]);

  return { isAnalyzing, analyzeResponses };
}
