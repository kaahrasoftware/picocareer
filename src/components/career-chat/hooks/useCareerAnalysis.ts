import { useState } from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCareerAnalysis(sessionId: string, addMessage: (message: Omit<CareerChatMessage, 'id'>) => Promise<CareerChatMessage | null>) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Function to analyze responses and generate career recommendations
  const analyzeResponses = async () => {
    // This function is no longer needed as the AI will handle recommendations directly
    // Keeping a simplified version for compatibility
    
    setIsAnalyzing(true);
    
    try {
      // Add a system message announcing final analysis
      await addMessage({
        session_id: sessionId,
        message_type: 'system',
        content: "I'll now provide a final analysis based on our conversation.",
        metadata: {},
        created_at: new Date().toISOString()
      });
      
      // We'll just add a slight delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Error during analysis:", error);
      toast("Sorry, there was a problem analyzing your responses. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analyzeResponses
  };
}
